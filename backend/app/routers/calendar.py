from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.core.database import get_db
from app.models.calendar_event import CalendarEvent
from app.models.user import User
from app.schemas.calendar_event import CalendarEventCreate, CalendarEventResponse
from app.routers.deps import get_current_user

router = APIRouter(prefix="/calendar", tags=["Calendar"])

@router.get("/events", response_model=List[CalendarEventResponse])
def get_calendar_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    events = (
        db.query(CalendarEvent)
        .options(joinedload(CalendarEvent.creator))
        .order_by(CalendarEvent.event_date.asc())
        .all()
    )
    return events

@router.post("/events", response_model=CalendarEventResponse, status_code=status.HTTP_201_CREATED)
def create_calendar_event(
    event_in: CalendarEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = CalendarEvent(
        title=event_in.title,
        description=event_in.description,
        category=event_in.category,
        event_date=event_in.event_date,
        is_all_day=event_in.is_all_day,
        creator_id=current_user.id
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.delete("/events/{event_id}")
def delete_calendar_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    db.delete(event)
    db.commit()
    return {"message": "Calendar event removed successfully"}
