import os
import random
from uuid import uuid4
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from PIL import Image, ImageOps

from app.core.database import get_db
from app.models.photo import Photo
from app.models.user import User
from app.schemas.photo import PhotoResponse, PhotoUpdate
from app.routers.deps import get_current_user

router = APIRouter(prefix="/photos", tags=["Photos"])

# Determine persistent uploads folder (supports Docker /data and local dev data)
PHOTOS_DIR = os.getenv("PHOTOS_DIR")
if not PHOTOS_DIR:
    if os.path.exists("/data"):
        PHOTOS_DIR = "/data/photos"
    else:
        PHOTOS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "photos"))

os.makedirs(PHOTOS_DIR, exist_ok=True)


@router.get("", response_model=List[PhotoResponse])
def get_photos(
    in_background: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all photos in gallery, optionally filtered by in_background status."""
    query = db.query(Photo)
    if in_background is not None:
        query = query.filter(Photo.in_background == in_background)
    
    return query.order_by(Photo.order_index.asc(), Photo.created_at.desc()).all()


@router.post("/upload", response_model=PhotoResponse, status_code=status.HTTP_201_CREATED)
async def upload_photo(
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    in_background: bool = Form(True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a new photo from computer, process with PIL, and register in database."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Empty filename provided")

    # Read uploaded file content
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    import io
    try:
        img = Image.open(io.BytesIO(contents))
        img = ImageOps.exif_transpose(img)
        
        # Convert RGBA / P / CMYK to RGB for clean JPEG saving
        if img.mode in ("RGBA", "P", "LA"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            background.paste(img, mask=img.split()[-1] if "A" in img.mode else None)
            img = background
        elif img.mode != "RGB":
            img = img.convert("RGB")

        orig_w, orig_h = img.size
        aspect = round(orig_w / max(orig_h, 1), 3)

        # Scale down if extraordinarily large to preserve storage and bandwidth
        max_dim = 1800
        if orig_w > max_dim or orig_h > max_dim:
            img.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)

        unique_id = uuid4().hex[:12]
        safe_name = f"photo_{unique_id}.jpg"
        target_path = os.path.join(PHOTOS_DIR, safe_name)

        img.save(target_path, "JPEG", quality=88, optimize=True)

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid or corrupted image file: {str(e)}")

    # Pick an organic slight tilt angle between -7 and 7 degrees
    rotations = [-7, -6, -5, -4, -3, 3, 4, 5, 6, 7]
    rotation = random.choice(rotations)

    new_photo = Photo(
        filename=safe_name,
        file_url=f"/api/photos/file/{safe_name}",
        original_name=file.filename,
        caption=caption.strip() if caption else None,
        in_background=in_background,
        aspect_ratio=aspect,
        rotation=rotation,
        order_index=0,
        creator_id=current_user.id
    )

    db.add(new_photo)
    db.commit()
    db.refresh(new_photo)

    return new_photo


@router.patch("/{photo_id}", response_model=PhotoResponse)
def update_photo(
    photo_id: int,
    payload: PhotoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Toggle photo between background and tab gallery, or update caption/rotation."""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    if payload.caption is not None:
        photo.caption = payload.caption.strip() if payload.caption else None
    if payload.in_background is not None:
        photo.in_background = payload.in_background
    if payload.rotation is not None:
        photo.rotation = payload.rotation
    if payload.order_index is not None:
        photo.order_index = payload.order_index

    db.commit()
    db.refresh(photo)
    return photo


@router.delete("/{photo_id}", status_code=status.HTTP_200_OK)
def delete_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a photo from gallery and remove physical file from disk if uploaded."""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    # If physical file exists in PHOTOS_DIR, delete it safely
    if photo.filename:
        file_path = os.path.join(PHOTOS_DIR, photo.filename)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except OSError:
                pass

    db.delete(photo)
    db.commit()
    return {"message": "Photo removed successfully", "id": photo_id}


@router.get("/file/{filename}")
def serve_photo_file(filename: str):
    """Serve uploaded photo files with browser caching."""
    # Sanitize to prevent path traversal
    safe_name = os.path.basename(filename)
    file_path = os.path.join(PHOTOS_DIR, safe_name)

    if not os.path.exists(file_path) or not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="Photo file not found")

    return FileResponse(
        file_path,
        media_type="image/jpeg",
        headers={"Cache-Control": "public, max-age=86400, immutable"}
    )
