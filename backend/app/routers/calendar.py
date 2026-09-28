from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime, time, timedelta
from app.core.database import get_db
from app.models.calendar_event import CalendarEvent
from app.models.trip import Trip
from app.models.user import User
from app.schemas.calendar_event import CalendarEventCreate, CalendarEventResponse
from app.schemas.user import UserResponse
from app.routers.deps import get_current_user

router = APIRouter(prefix="/calendar", tags=["Calendar"])

def generate_events_for_trip(trip: Trip) -> List[CalendarEventResponse]:
    if not trip.start_date:
        return []

    start_dt = trip.start_date
    end_dt = trip.end_date if (trip.end_date and trip.end_date >= trip.start_date) else trip.start_date

    total_days = max(1, (end_dt.date() - start_dt.date()).days + 1)
    if total_days > 60:
        total_days = 60

    base_title = (trip.title or f"Trip to {trip.destination}").strip()
    if not base_title.lower().startswith("trip"):
        base_title = f"Trip: {base_title}"

    creator_resp = UserResponse.model_validate(trip.creator, from_attributes=True) if trip.creator else None

    events = []
    for day_idx in range(total_days):
        curr_date = start_dt.date() + timedelta(days=day_idx)

        if total_days > 1:
            title = f"{base_title} (Day {day_idx + 1}/{total_days})"
        else:
            title = base_title

        desc_lines = []
        if trip.destination:
            desc_lines.append(f"Destination: {trip.destination}")

        status_display = trip.status.capitalize() if trip.status else "Planned"
        if status_display.lower() == "planning":
            status_display = "Planned"
        desc_lines.append(f"Status: {status_display}")

        if trip.description:
            desc_lines.append(trip.description.strip())

        # Selected transports
        if trip.transports:
            sel_trans = [t for t in trip.transports if t.is_selected]
            if sel_trans:
                t_strs = [f"- {t.type.capitalize()}: {t.title}" for t in sel_trans]
                desc_lines.append("Transport:\n" + "\n".join(t_strs))

        # Selected lodgings
        if trip.lodgings:
            sel_lodg = [l for l in trip.lodgings if l.is_selected]
            if sel_lodg:
                l_strs = [f"- {l.name} ({l.type.capitalize()})" for l in sel_lodg]
                desc_lines.append("Lodging:\n" + "\n".join(l_strs))

        # Day's itinerary items
        curr_day_num = day_idx + 1
        day_items = [
            it for it in trip.itinerary_items
            if (it.day_number == curr_day_num) or (it.item_date and it.item_date.date() == curr_date)
        ]
        if day_items:
            it_strs = [f"- {it.time_of_day + ': ' if it.time_of_day else ''}{it.title}" for it in day_items]
            desc_lines.append("Today's Itinerary:\n" + "\n".join(it_strs))

        if day_idx == 0 and (start_dt.hour != 0 or start_dt.minute != 0):
            event_dt = datetime.combine(curr_date, start_dt.time())
        else:
            event_dt = datetime.combine(curr_date, time(9, 0))

        if start_dt.tzinfo:
            event_dt = event_dt.replace(tzinfo=start_dt.tzinfo)

        event_id = -(trip.id * 1000 + day_idx)

        events.append(CalendarEventResponse(
            id=event_id,
            title=title,
            description="\n\n".join(desc_lines) if desc_lines else None,
            category="trip",
            event_date=event_dt,
            is_all_day=True,
            creator_id=trip.creator_id,
            created_at=trip.created_at,
            creator=creator_resp,
            trip_id=trip.id
        ))

    return events


@router.get("/events", response_model=List[CalendarEventResponse])
def get_calendar_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Standard calendar events
    db_events = (
        db.query(CalendarEvent)
        .options(joinedload(CalendarEvent.creator))
        .order_by(CalendarEvent.event_date.asc())
        .all()
    )
    standard_events = [
        CalendarEventResponse.model_validate(e, from_attributes=True)
        for e in db_events
    ]

    # 2. Qualified trips (status at least planned: planning, planned, booked, completed)
    qualified_statuses = {"planning", "planned", "booked", "completed"}
    trips = (
        db.query(Trip)
        .options(
            joinedload(Trip.creator),
            joinedload(Trip.transports),
            joinedload(Trip.lodgings),
            joinedload(Trip.itinerary_items),
        )
        .filter(Trip.start_date.isnot(None))
        .all()
    )

    trip_events = []
    for trip in trips:
        if trip.status and trip.status.strip().lower() in qualified_statuses:
            trip_events.extend(generate_events_for_trip(trip))

    # 3. Combine and sort
    all_events = standard_events + trip_events

    def sort_key(e: CalendarEventResponse):
        dt = e.event_date
        naive_dt = dt.replace(tzinfo=None) if hasattr(dt, "tzinfo") and dt.tzinfo else dt
        return (naive_dt, e.id)

    all_events.sort(key=sort_key)
    return all_events

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
    if event_id < 0:
        raise HTTPException(
            status_code=400,
            detail="This event is automatically synchronized from a trip. To remove it, please update or delete the trip in the Travel Planner."
        )
    event = db.query(CalendarEvent).filter(CalendarEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Calendar event not found")
    db.delete(event)
    db.commit()
    return {"message": "Calendar event removed successfully"}
