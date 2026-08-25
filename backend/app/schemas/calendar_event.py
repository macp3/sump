from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.user import UserResponse

class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "plan"
    event_date: datetime
    is_all_day: bool = False

class CalendarEventResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: str
    event_date: datetime
    is_all_day: bool
    creator_id: int
    created_at: datetime
    creator: UserResponse

    class Config:
        from_attributes = True
