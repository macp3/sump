from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.app_setting import AppSetting
from app.models.user import User
from app.schemas.app_setting import ClockStateResponse
from app.routers.deps import get_current_user

router = APIRouter(prefix="/clock", tags=["Clock"])

SETTING_KEY_CLOCK_STARTED_AT = "clock_started_at"

@router.get("", response_model=ClockStateResponse)
def get_clock_state(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    setting = db.query(AppSetting).filter(AppSetting.key == SETTING_KEY_CLOCK_STARTED_AT).first()
    return {
        "clock_started_at": setting.value if setting and setting.value else None
    }

@router.post("/start", response_model=ClockStateResponse)
def start_clock(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    setting = db.query(AppSetting).filter(AppSetting.key == SETTING_KEY_CLOCK_STARTED_AT).first()
    
    # If already set, do not reset/overwrite (immutable as requested)
    if setting and setting.value:
        return {"clock_started_at": setting.value}
    
    now_iso = datetime.now(timezone.utc).isoformat()
    if not setting:
        setting = AppSetting(key=SETTING_KEY_CLOCK_STARTED_AT, value=now_iso)
        db.add(setting)
    else:
        setting.value = now_iso
        
    db.commit()
    db.refresh(setting)
    return {"clock_started_at": setting.value}
