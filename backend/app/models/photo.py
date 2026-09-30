from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    original_name = Column(String(255), nullable=True)
    caption = Column(String(255), nullable=True)
    in_background = Column(Boolean, default=True, index=True)
    aspect_ratio = Column(Float, default=1.0)
    rotation = Column(Integer, default=0)
    order_index = Column(Integer, default=0)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    creator = relationship("User", foreign_keys=[creator_id])
