from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timezone
from app.core.database import get_db
from app.models.miss_you import MissYouLog
from app.models.user import User
from app.schemas.miss_you import MissYouStatsResponse
from app.routers.deps import get_current_user

router = APIRouter(prefix="/miss-you", tags=["Miss You"])

def format_utc_iso(dt: datetime) -> str:
    if dt is None:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()

def get_stats_for_user(db: Session, current_user: User) -> MissYouStatsResponse:
    # Find partner
    partner = db.query(User).filter(User.id != current_user.id).first()
    partner_name = partner.display_name if partner else "Partner"
    partner_id = partner.id if partner else -1

    partner_count = db.query(MissYouLog).filter(MissYouLog.sender_id == partner_id).count()
    my_count = db.query(MissYouLog).filter(MissYouLog.sender_id == current_user.id).count()

    last_partner_log = (
        db.query(MissYouLog)
        .filter(MissYouLog.sender_id == partner_id)
        .order_by(desc(MissYouLog.created_at))
        .first()
    )

    last_my_log = (
        db.query(MissYouLog)
        .filter(MissYouLog.sender_id == current_user.id)
        .order_by(desc(MissYouLog.created_at))
        .first()
    )

    partner_last_sent = format_utc_iso(last_partner_log.created_at) if last_partner_log else None
    my_last_sent = format_utc_iso(last_my_log.created_at) if last_my_log else None

    return MissYouStatsResponse(
        partner_count=partner_count,
        my_count=my_count,
        partner_last_sent=partner_last_sent,
        my_last_sent=my_last_sent,
        partner_name=partner_name
    )

@router.get("", response_model=MissYouStatsResponse)
def get_miss_you_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_stats_for_user(db, current_user)

@router.post("", response_model=MissYouStatsResponse, status_code=status.HTTP_201_CREATED)
def send_miss_you_ping(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log_entry = MissYouLog(
        sender_id=current_user.id,
        created_at=datetime.now(timezone.utc)
    )
    db.add(log_entry)
    db.commit()
    return get_stats_for_user(db, current_user)
