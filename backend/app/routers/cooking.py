from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.cooking import FridgeItem, ShoppingItem, MealPlan
from app.models.user import User
from app.schemas.cooking import (
    FridgeItemCreate,
    FridgeItemUpdate,
    FridgeItemResponse,
    ShoppingItemCreate,
    ShoppingItemUpdate,
    ShoppingItemResponse,
    MealPlanCreate,
    MealPlanUpdate,
    MealPlanResponse
)
from app.routers.deps import get_current_user

router = APIRouter(prefix="/cooking", tags=["Cooking"])

# --- 1. Fridge & Pantry Inventory Endpoints ---

@router.get("/fridge", response_model=List[FridgeItemResponse])
def get_fridge_items(
    location: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(FridgeItem).options(joinedload(FridgeItem.creator))
    if location and location != "all":
        query = query.filter(FridgeItem.storage_location == location)
    if category and category != "all":
        query = query.filter(FridgeItem.category == category)
    if status_filter and status_filter != "all":
        query = query.filter(FridgeItem.status == status_filter)
    
    return query.order_by(FridgeItem.created_at.desc()).all()

@router.post("/fridge", response_model=FridgeItemResponse, status_code=status.HTTP_201_CREATED)
def create_fridge_item(
    item_in: FridgeItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = FridgeItem(
        name=item_in.name.strip(),
        quantity=item_in.quantity.strip() if item_in.quantity else None,
        category=item_in.category or "produce",
        storage_location=item_in.storage_location or "fridge",
        expiry_date=item_in.expiry_date,
        status=item_in.status or "fresh",
        notes=item_in.notes.strip() if item_in.notes else None,
        creator_id=current_user.id
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/fridge/{item_id}", response_model=FridgeItemResponse)
def update_fridge_item(
    item_id: int,
    item_in: FridgeItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(FridgeItem).filter(FridgeItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Fridge item not found")
    
    update_data = item_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(item, field, val)
    item.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(item)
    return item

@router.delete("/fridge/{item_id}", status_code=status.HTTP_200_OK)
def delete_fridge_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(FridgeItem).filter(FridgeItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Fridge item not found")
    db.delete(item)
    db.commit()
    return {"message": "Fridge item deleted successfully"}


# --- 2. Shopping List Endpoints ---

@router.get("/shopping", response_model=List[ShoppingItemResponse])
def get_shopping_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(ShoppingItem).options(joinedload(ShoppingItem.creator)).order_by(
        ShoppingItem.is_bought.asc(),
        ShoppingItem.created_at.desc()
    ).all()

@router.post("/shopping", response_model=ShoppingItemResponse, status_code=status.HTTP_201_CREATED)
def create_shopping_item(
    item_in: ShoppingItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = ShoppingItem(
        name=item_in.name.strip(),
        quantity=item_in.quantity.strip() if item_in.quantity else None,
        category=item_in.category or "produce",
        is_bought=item_in.is_bought or False,
        urgency=item_in.urgency or "normal",
        notes=item_in.notes.strip() if item_in.notes else None,
        creator_id=current_user.id
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/shopping/{item_id}", response_model=ShoppingItemResponse)
def update_shopping_item(
    item_id: int,
    item_in: ShoppingItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(ShoppingItem).filter(ShoppingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Shopping item not found")
    
    update_data = item_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(item, field, val)
    item.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(item)
    return item

@router.delete("/shopping/{item_id}", status_code=status.HTTP_200_OK)
def delete_shopping_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(ShoppingItem).filter(ShoppingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Shopping item not found")
    db.delete(item)
    db.commit()
    return {"message": "Shopping item deleted successfully"}

@router.delete("/shopping/purchased/clear", status_code=status.HTTP_200_OK)
def clear_purchased_shopping_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    deleted_count = db.query(ShoppingItem).filter(ShoppingItem.is_bought == True).delete()
    db.commit()
    return {"message": f"Cleared {deleted_count} purchased items"}

@router.post("/shopping/{item_id}/move-to-fridge", response_model=FridgeItemResponse)
def move_shopping_item_to_fridge(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    shop_item = db.query(ShoppingItem).filter(ShoppingItem.id == item_id).first()
    if not shop_item:
        raise HTTPException(status_code=404, detail="Shopping item not found")
    
    # Create corresponding fridge item
    fridge_item = FridgeItem(
        name=shop_item.name,
        quantity=shop_item.quantity,
        category=shop_item.category,
        storage_location="fridge",
        status="fresh",
        notes=shop_item.notes,
        creator_id=current_user.id
    )
    db.add(fridge_item)
    db.delete(shop_item)
    db.commit()
    db.refresh(fridge_item)
    return fridge_item


# --- 3. Weekly Meal Planner Endpoints ---

@router.get("/meals", response_model=List[MealPlanResponse])
def get_meal_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Return all planned meals
    return db.query(MealPlan).options(joinedload(MealPlan.creator)).order_by(
        MealPlan.meal_date.asc().nullslast(),
        MealPlan.created_at.asc()
    ).all()

@router.post("/meals", response_model=MealPlanResponse, status_code=status.HTTP_201_CREATED)
def create_meal_plan(
    meal_in: MealPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meal = MealPlan(
        day_of_week=meal_in.day_of_week.lower(),
        meal_date=meal_in.meal_date,
        meal_type=meal_in.meal_type or "dinner",
        recipe_title=meal_in.recipe_title.strip(),
        chef=meal_in.chef or "both",
        ingredients=meal_in.ingredients.strip() if meal_in.ingredients else None,
        prep_time_minutes=meal_in.prep_time_minutes,
        status=meal_in.status or "proposed",
        notes=meal_in.notes.strip() if meal_in.notes else None,
        creator_id=current_user.id
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)
    return meal

@router.put("/meals/{meal_id}", response_model=MealPlanResponse)
def update_meal_plan(
    meal_id: int,
    meal_in: MealPlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meal = db.query(MealPlan).filter(MealPlan.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    
    update_data = meal_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(meal, field, val)
    meal.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(meal)
    return meal

@router.delete("/meals/{meal_id}", status_code=status.HTTP_200_OK)
def delete_meal_plan(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meal = db.query(MealPlan).filter(MealPlan.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    db.delete(meal)
    db.commit()
    return {"message": "Meal plan deleted successfully"}

@router.post("/meals/{meal_id}/add-to-shopping-list", response_model=List[ShoppingItemResponse])
def add_meal_ingredients_to_shopping_list(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meal = db.query(MealPlan).filter(MealPlan.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    if not meal.ingredients:
        return []

    # Split lines or commas
    raw_lines = [l.strip() for l in meal.ingredients.replace(",", "\n").splitlines() if l.strip()]
    created_items = []
    for item_name in raw_lines:
        clean_name = item_name.lstrip("-•* ").strip()
        if not clean_name:
            continue
        shop_item = ShoppingItem(
            name=clean_name,
            category="produce",
            urgency="normal",
            notes=f"For {meal.recipe_title}",
            creator_id=current_user.id
        )
        db.add(shop_item)
        created_items.append(shop_item)

    db.commit()
    for item in created_items:
        db.refresh(item)
    return created_items
