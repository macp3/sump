from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class DateProposal(Base):
    __tablename__ = "date_proposals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="romantic")
    location = Column(String(150), nullable=True)
    location_url = Column(String(255), nullable=True)
    proposed_date = Column(DateTime, nullable=False)
    dress_code = Column(String(100), nullable=True)
    estimated_cost = Column(String(20), default="$$")
    
    # Surprise features
    is_surprise = Column(Boolean, default=False)
    surprise_revealed = Column(Boolean, default=False)
    
    # Status: 'proposed', 'accepted', 'declined', 'completed'
    status = Column(String(30), default="proposed", index=True)
    
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    creator = relationship("User", back_populates="created_dates", foreign_keys=[creator_id])
    
    # Response from the other person
    response_note = Column(Text, nullable=True)
    
    # Memories after completion
    memory_notes = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True) # 1-5
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
