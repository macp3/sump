from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.user import UserResponse

# --- Fridge Item Schemas ---
class FridgeItemBase(BaseModel):
    name: str
    quantity: Optional[str] = None
    category: str = "produce"  # dairy, produce, meat_fish, pantry, bakery, drinks, other
    storage_location: str = "fridge"  # fridge, freezer, pantry
    expiry_date: Optional[datetime] = None
    status: str = "fresh"  # fresh, use_soon, expired
    notes: Optional[str] = None

class FridgeItemCreate(FridgeItemBase):
    pass

class FridgeItemUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[str] = None
    category: Optional[str] = None
    storage_location: Optional[str] = None
    expiry_date: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class FridgeItemResponse(FridgeItemBase):
    id: int
    creator_id: int
    created_at: datetime
    updated_at: datetime
    creator: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# --- Shopping Item Schemas ---
class ShoppingItemBase(BaseModel):
    name: str
    quantity: Optional[str] = None
    category: str = "produce"  # dairy, produce, meat_fish, pantry, bakery, drinks, household, other
    is_bought: bool = False
    urgency: str = "normal"  # low, normal, high
    notes: Optional[str] = None

class ShoppingItemCreate(ShoppingItemBase):
    pass

class ShoppingItemUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[str] = None
    category: Optional[str] = None
    is_bought: Optional[bool] = None
    urgency: Optional[str] = None
    notes: Optional[str] = None

class ShoppingItemResponse(ShoppingItemBase):
    id: int
    creator_id: int
    created_at: datetime
    updated_at: datetime
    creator: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# --- Meal Plan Schemas ---
class MealPlanBase(BaseModel):
    day_of_week: str  # monday, tuesday, wednesday, thursday, friday, saturday, sunday
    meal_date: Optional[datetime] = None
    meal_type: str = "dinner"  # dinner, lunch, breakfast, dessert, snack
    recipe_title: str
    chef: str = "both"  # maciej, selina, both, dining_out
    ingredients: Optional[str] = None
    prep_time_minutes: Optional[int] = None
    status: str = "proposed"  # proposed, accepted, cooked
    notes: Optional[str] = None

class MealPlanCreate(MealPlanBase):
    pass

class MealPlanUpdate(BaseModel):
    day_of_week: Optional[str] = None
    meal_date: Optional[datetime] = None
    meal_type: Optional[str] = None
    recipe_title: Optional[str] = None
    chef: Optional[str] = None
    ingredients: Optional[str] = None
    prep_time_minutes: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class MealPlanResponse(MealPlanBase):
    id: int
    creator_id: int
    created_at: datetime
    updated_at: datetime
    creator: Optional[UserResponse] = None

    class Config:
        from_attributes = True
