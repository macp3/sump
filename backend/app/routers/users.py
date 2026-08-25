from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash
from app.models.user import User
from app.schemas.user import UserResponse, UserMoodUpdate, PasswordChangeRequest
from app.routers.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/pair", response_model=List[UserResponse])
def get_pair_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).order_by(User.id).all()
    return users

@router.put("/mood", response_model=UserResponse)
def update_mood(
    mood_data: UserMoodUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.current_mood = mood_data.current_mood
    if mood_data.avatar_color:
        current_user.avatar_color = mood_data.avatar_color
    current_user.mood_updated_at = datetime.now(timezone.utc)
    current_user.last_active_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/password")
def change_password(
    pwd_data: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(pwd_data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    if len(pwd_data.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must have at least 6 characters"
        )
        
    current_user.hashed_password = get_password_hash(pwd_data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}
