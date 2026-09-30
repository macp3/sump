import os
import io
from uuid import uuid4
from PIL import Image, ImageOps
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash
from app.models.user import User
from app.schemas.user import UserResponse, UserMoodUpdate, PasswordChangeRequest
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
