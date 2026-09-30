import os
import io
import smtplib
from urllib.parse import quote
from email.message import EmailMessage
from uuid import uuid4
from PIL import Image, ImageOps
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash
from app.core.config import settings
from app.models.user import User
from app.schemas.user import (
    UserResponse, 
    UserMoodUpdate, 
    PasswordChangeRequest,
    ImBoredRequest,
    ImBoredResponse
)
from app.routers.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

# Determine persistent avatars folder (supports Docker /data and local dev data)
AVATARS_DIR = os.getenv("AVATARS_DIR")
if not AVATARS_DIR:
    if os.path.exists("/data"):
        AVATARS_DIR = "/data/avatars"
    else:
        AVATARS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "avatars"))

os.makedirs(AVATARS_DIR, exist_ok=True)

@router.get("/pair", response_model=List[UserResponse])
def get_pair_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).order_by(User.id).all()
    return users

@router.put("/mood", response_model=UserResponse)
def update_mood(
    mood_data: UserMoodUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.current_mood = mood_data.current_mood
    if mood_data.avatar_color:
        current_user.avatar_color = mood_data.avatar_color
    if mood_data.avatar_url is not None:
        current_user.avatar_url = mood_data.avatar_url
    current_user.mood_updated_at = datetime.now(timezone.utc)
    current_user.last_active_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Empty filename provided")

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    try:
        img = Image.open(io.BytesIO(contents))
        img = ImageOps.exif_transpose(img)

        # Convert to RGB
        if img.mode in ("RGBA", "P", "LA"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            background.paste(img, mask=img.split()[-1] if "A" in img.mode else None)
            img = background
        elif img.mode != "RGB":
            img = img.convert("RGB")

        # Center square crop
        w, h = img.size
        min_dim = min(w, h)
        left = (w - min_dim) // 2
        top = (h - min_dim) // 2
        img = img.crop((left, top, left + min_dim, top + min_dim))

        # High quality thumbnail 400x400
        img.thumbnail((400, 400), Image.Resampling.LANCZOS)

        # Delete previous avatar file if exists
        if current_user.avatar_url:
            old_name = current_user.avatar_url.split("/")[-1]
            old_path = os.path.join(AVATARS_DIR, old_name)
            if os.path.exists(old_path):
                try:
                    os.remove(old_path)
                except Exception:
                    pass

        safe_name = f"avatar_{current_user.id}_{uuid4().hex[:8]}.jpg"
        target_path = os.path.join(AVATARS_DIR, safe_name)
        img.save(target_path, "JPEG", quality=90, optimize=True)

        current_user.avatar_url = f"/api/users/avatar/{safe_name}"
        db.commit()
        db.refresh(current_user)
        return current_user

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {str(e)}")

@router.get("/avatar/{filename}")
def get_avatar_file(filename: str):
    clean_name = os.path.basename(filename)
    file_path = os.path.join(AVATARS_DIR, clean_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Avatar not found")
    return FileResponse(file_path, media_type="image/jpeg")

@router.delete("/avatar", response_model=UserResponse)
def remove_avatar(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.avatar_url:
        old_name = current_user.avatar_url.split("/")[-1]
        old_path = os.path.join(AVATARS_DIR, old_name)
        if os.path.exists(old_path):
            try:
                os.remove(old_path)
            except Exception:
                pass
        current_user.avatar_url = None
        db.commit()
        db.refresh(current_user)
    return current_user

@router.put("/password")
def change_password(
    pwd_data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(pwd_data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    if len(pwd_data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must have at least 6 characters"
        )
        
    current_user.hashed_password = get_password_hash(pwd_data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}

def send_email_smtp(to_email: str, subject: str, text_content: str, html_content: str) -> None:
    msg = EmailMessage()
    msg["Subject"] = subject
    from_addr = settings.SMTP_FROM or settings.SMTP_USER or "sump@app.local"
    msg["From"] = from_addr
    msg["To"] = to_email
    msg.set_content(text_content)
    msg.add_alternative(html_content, subtype="html")

    if settings.SMTP_PORT == 465 and not settings.SMTP_USE_TLS:
        with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12) as server:
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
    else:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)

@router.post("/im-bored", response_model=ImBoredResponse)
def trigger_im_bored(
    payload: Optional[ImBoredRequest] = None,
    current_user: User = Depends(get_current_user)
):
    sender_name = current_user.display_name or current_user.username
    is_selina = "selina" in current_user.username.lower() or "selina" in (current_user.display_name or "").lower()

    if is_selina:
        recipient_name = "Maciej"
        recipient_email = settings.MACIEJ_EMAIL
    else:
        recipient_name = "Selina"
        recipient_email = settings.SELINA_EMAIL

    custom_text = (payload.custom_message.strip() if payload and payload.custom_message else None)
    
    subject = f"[SUMP] {sender_name} is bored!"
    
    body_text = f"""Czesc {recipient_name}!

{sender_name} wlasnie kliknal(a) przycisk "IM BORED" w SUMP.
{f'Wiadomosc: "{custom_text}"' if custom_text else 'Daje Ci znac, ze sie nudzi i mysli o Tobie!'}

Zajrzyj do SUMP, zadzwon albo zaplanujcie cos wspolnego!

--
Wyslano z SUMP Atelier
"""

    custom_html_section = f'<div style="background: #faf8f4; border-left: 3px solid #b58c38; padding: 12px 16px; margin: 16px 0; font-style: italic; color: #44403c;">&ldquo;{custom_text}&rdquo;</div>' if custom_text else ''

    body_html = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f6f4ee; margin: 0; padding: 24px; color: #181c24; }}
    .card {{ max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e0d4; padding: 32px; box-shadow: 0 4px 14px rgba(0,0,0,0.05); }}
    .badge {{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #e11d48; font-weight: bold; }}
    h1 {{ font-family: Georgia, serif; font-size: 26px; color: #181c24; margin: 14px 0 16px 0; font-weight: normal; }}
    p {{ font-size: 14px; line-height: 1.6; color: #44403c; margin: 0 0 14px 0; }}
    .footer {{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 10px; color: #a8a29e; border-top: 1px solid #e5e0d4; padding-top: 16px; margin-top: 24px; text-transform: uppercase; letter-spacing: 0.1em; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">[ SUMP // EMERGENCY SIGNAL ]</div>
    <h1>{sender_name} is bored!</h1>
    <p>Czesc <strong>{recipient_name}</strong>,</p>
    <p>Twoj partner <strong>{sender_name}</strong> wlasnie kliknal(a) przycisk <strong>IM BORED</strong> w SUMP.</p>
    {custom_html_section}
    <p>Daj znac, zadzwon, wyslij wiadomosc albo dodaj nowa randke lub wyjazd do wspolnego kalendarza!</p>
    <div class="footer">Wyslano z SUMP Atelier dla {recipient_email}</div>
  </div>
</body>
</html>
"""

    encoded_subject = quote(subject)
    encoded_body = quote(body_text)
    mailto_url = f"mailto:{recipient_email}?subject={encoded_subject}&body={encoded_body}"

    # Check if SMTP credentials are configured
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        return ImBoredResponse(
            status="no_smtp",
            sender_name=sender_name,
            recipient_name=recipient_name,
            recipient_email=recipient_email,
            subject=subject,
            body=body_text,
            message="Serwer SMTP nie jest skonfigurowany w pliku .env (brak SMTP_USER i SMTP_PASSWORD).",
            mailto_url=mailto_url
        )

    try:
        send_email_smtp(recipient_email, subject, body_text, body_html)
        return ImBoredResponse(
            status="sent",
            sender_name=sender_name,
            recipient_name=recipient_name,
            recipient_email=recipient_email,
            subject=subject,
            body=body_text,
            message=f"Wyslano powiadomienie email do {recipient_email}.",
            mailto_url=mailto_url
        )
    except Exception as exc:
        return ImBoredResponse(
            status="failed",
            sender_name=sender_name,
            recipient_name=recipient_name,
            recipient_email=recipient_email,
            subject=subject,
            body=body_text,
            message=f"Blad podczas wysylania przez SMTP: {str(exc)}",
            mailto_url=mailto_url
        )
