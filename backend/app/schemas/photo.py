from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.user import UserResponse

class PhotoBase(BaseModel):
    caption: Optional[str] = None
    in_background: bool = True

class PhotoCreate(PhotoBase):
    filename: str
    file_url: str
    original_name: Optional[str] = None
    aspect_ratio: float = 1.0
    rotation: int = 0
    order_index: int = 0

class PhotoUpdate(BaseModel):
    caption: Optional[str] = None
    in_background: Optional[bool] = None
    rotation: Optional[int] = None
    order_index: Optional[int] = None

class PhotoResponse(BaseModel):
    id: int
    filename: str
    file_url: str
    original_name: Optional[str] = None
    caption: Optional[str] = None
    in_background: bool
    aspect_ratio: float
    rotation: int
    order_index: int
    creator_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    creator: Optional[UserResponse] = None

    class Config:
        from_attributes = True
