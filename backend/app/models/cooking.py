from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class FridgeItem(Base):
    __tablename__ = "fridge_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    quantity = Column(String(50), nullable=True)
    category = Column(String(50), default="produce")  # dairy, produce, meat_fish, pantry, bakery, drinks, other
    storage_location = Column(String(50), default="fridge")  # fridge, freezer, pantry
    expiry_date = Column(DateTime, nullable=True)
    status = Column(String(30), default="fresh")  # fresh, use_soon, expired
    notes = Column(Text, nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    creator = relationship("User", foreign_keys=[creator_id])


class ShoppingItem(Base):
    __tablename__ = "shopping_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    quantity = Column(String(50), nullable=True)
    category = Column(String(50), default="produce")  # dairy, produce, meat_fish, pantry, bakery, drinks, household, other
    is_bought = Column(Boolean, default=False)
    urgency = Column(String(30), default="normal")  # low, normal, high
    notes = Column(Text, nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    creator = relationship("User", foreign_keys=[creator_id])


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True, index=True)
    day_of_week = Column(String(20), nullable=False)  # monday, tuesday, wednesday, thursday, friday, saturday, sunday
    meal_date = Column(DateTime, nullable=True)
    meal_type = Column(String(30), default="dinner")  # dinner, lunch, breakfast, dessert, snack
    recipe_title = Column(String(150), nullable=False)
    chef = Column(String(50), default="both")  # maciej, selina, both, dining_out
    ingredients = Column(Text, nullable=True)
    prep_time_minutes = Column(Integer, nullable=True)
    status = Column(String(30), default="proposed")  # proposed, accepted, cooked
    notes = Column(Text, nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    creator = relationship("User", foreign_keys=[creator_id])
