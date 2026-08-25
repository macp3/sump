from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    username: str
    display_name: str
    avatar_color: Optional[str] = "rose"
    current_mood: Optional[str] = None

class UserResponse(UserBase):
    id: int
    mood_updated_at: Optional[datetime] = None
    last_active_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserMoodUpdate(BaseModel):
    current_mood: str
    avatar_color: Optional[str] = None

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str
