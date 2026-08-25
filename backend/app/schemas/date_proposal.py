from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.user import UserResponse

class DateProposalBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "romantic"
    location: Optional[str] = None
    location_url: Optional[str] = None
    proposed_date: datetime
    dress_code: Optional[str] = None
    estimated_cost: Optional[str] = "$$"
    is_surprise: bool = False

class DateProposalCreate(DateProposalBase):
    pass

class DateProposalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    location_url: Optional[str] = None
    proposed_date: Optional[datetime] = None
    dress_code: Optional[str] = None
    estimated_cost: Optional[str] = None
    is_surprise: Optional[bool] = None

class DateProposalRespond(BaseModel):
    status: str # 'accepted', 'declined'
    response_note: Optional[str] = None

class DateProposalComplete(BaseModel):
    rating: Optional[int] = None # 1-5
    memory_notes: Optional[str] = None

class DateProposalResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    category: str
    location: Optional[str] = None
    location_url: Optional[str] = None
    proposed_date: datetime
    dress_code: Optional[str] = None
    estimated_cost: Optional[str] = "$$"
    is_surprise: bool
    surprise_revealed: bool
    status: str
    creator_id: int
    creator: UserResponse
    response_note: Optional[str] = None
    rating: Optional[int] = None
    memory_notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DateIdeaIdea(BaseModel):
    title: str
    category: str
    description: str
    dress_code: str
    estimated_cost: str
