from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.core.database import get_db
from app.models.trip import Trip, TripTransport, TripLodging, TripItineraryItem
from app.models.user import User
from app.schemas.trip import (
    TripCreate,
    TripUpdate,
    TripResponse,
    TripTransportCreate,
    TripTransportUpdate,
    TripTransportResponse,
    TripLodgingCreate,
    TripLodgingUpdate,
    TripLodgingResponse,
    TripItineraryItemCreate,
    TripItineraryItemUpdate,
    TripItineraryItemResponse
)
from app.routers.deps import get_current_user

router = APIRouter(prefix="/trips", tags=["Trips"])

# --- Trip Core Endpoints ---

@router.get("", response_model=List[TripResponse])
def get_trips(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Trip).options(
        joinedload(Trip.creator),
        joinedload(Trip.transports).joinedload(TripTransport.creator),
        joinedload(Trip.lodgings).joinedload(TripLodging.creator),
        joinedload(Trip.itinerary_items).joinedload(TripItineraryItem.creator)
    )
    if status_filter and status_filter != "all":
        query = query.filter(Trip.status == status_filter)
        
    trips = query.order_by(Trip.start_date.asc().nullslast(), Trip.created_at.desc()).all()
    return trips

@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(
    trip_in: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = Trip(
        title=trip_in.title,
        destination=trip_in.destination,
        description=trip_in.description,
        start_date=trip_in.start_date,
        end_date=trip_in.end_date,
        status=trip_in.status,
        estimated_budget=trip_in.estimated_budget,
        currency=trip_in.currency,
        notes=trip_in.notes,
        creator_id=current_user.id
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip

@router.get("/{trip_id}", response_model=TripResponse)
def get_trip_details(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = (
        db.query(Trip)
        .options(
            joinedload(Trip.creator),
            joinedload(Trip.transports).joinedload(TripTransport.creator),
            joinedload(Trip.lodgings).joinedload(TripLodging.creator),
            joinedload(Trip.itinerary_items).joinedload(TripItineraryItem.creator)
        )
        .filter(Trip.id == trip_id)
        .first()
    )
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(
    trip_id: int,
    trip_in: TripUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    update_data = trip_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(trip, field, val)

    db.commit()
    db.refresh(trip)
    return trip

@router.delete("/{trip_id}")
def delete_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    db.delete(trip)
    db.commit()
    return {"message": "Trip removed successfully"}


# --- Transportation Sub-Endpoints ---

@router.post("/{trip_id}/transports", response_model=TripTransportResponse, status_code=status.HTTP_201_CREATED)
def add_transport_option(
    trip_id: int,
    transport_in: TripTransportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    transport = TripTransport(
        trip_id=trip_id,
        type=transport_in.type,
        title=transport_in.title,
        departure_location=transport_in.departure_location,
        arrival_location=transport_in.arrival_location,
        departure_time=transport_in.departure_time,
        arrival_time=transport_in.arrival_time,
        cost=transport_in.cost,
        booking_reference=transport_in.booking_reference,
        booking_url=transport_in.booking_url,
        is_selected=transport_in.is_selected,
        notes=transport_in.notes,
        creator_id=current_user.id
    )
    db.add(transport)
    db.commit()
    db.refresh(transport)
    return transport

@router.put("/{trip_id}/transports/{transport_id}", response_model=TripTransportResponse)
def update_transport_option(
    trip_id: int,
    transport_id: int,
    transport_in: TripTransportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transport = db.query(TripTransport).filter(
        TripTransport.id == transport_id,
        TripTransport.trip_id == trip_id
    ).first()
    if not transport:
        raise HTTPException(status_code=404, detail="Transport option not found")

    update_data = transport_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(transport, field, val)

    db.commit()
    db.refresh(transport)
    return transport

@router.delete("/{trip_id}/transports/{transport_id}")
def delete_transport_option(
    trip_id: int,
    transport_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    transport = db.query(TripTransport).filter(
        TripTransport.id == transport_id,
        TripTransport.trip_id == trip_id
    ).first()
    if not transport:
        raise HTTPException(status_code=404, detail="Transport option not found")

    db.delete(transport)
    db.commit()
    return {"message": "Transport option removed"}


# --- Lodging Sub-Endpoints ---

@router.post("/{trip_id}/lodgings", response_model=TripLodgingResponse, status_code=status.HTTP_201_CREATED)
def add_lodging_option(
    trip_id: int,
    lodging_in: TripLodgingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    lodging = TripLodging(
        trip_id=trip_id,
        type=lodging_in.type,
        name=lodging_in.name,
        location=lodging_in.location,
        check_in=lodging_in.check_in,
        check_out=lodging_in.check_out,
        cost=lodging_in.cost,
        booking_url=lodging_in.booking_url,
        is_selected=lodging_in.is_selected,
        notes=lodging_in.notes,
        creator_id=current_user.id
    )
    db.add(lodging)
    db.commit()
    db.refresh(lodging)
    return lodging

@router.put("/{trip_id}/lodgings/{lodging_id}", response_model=TripLodgingResponse)
def update_lodging_option(
    trip_id: int,
    lodging_id: int,
    lodging_in: TripLodgingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lodging = db.query(TripLodging).filter(
        TripLodging.id == lodging_id,
        TripLodging.trip_id == trip_id
    ).first()
    if not lodging:
        raise HTTPException(status_code=404, detail="Lodging option not found")

    update_data = lodging_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(lodging, field, val)

    db.commit()
    db.refresh(lodging)
    return lodging

@router.delete("/{trip_id}/lodgings/{lodging_id}")
def delete_lodging_option(
    trip_id: int,
    lodging_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lodging = db.query(TripLodging).filter(
        TripLodging.id == lodging_id,
        TripLodging.trip_id == trip_id
    ).first()
    if not lodging:
        raise HTTPException(status_code=404, detail="Lodging option not found")

    db.delete(lodging)
    db.commit()
    return {"message": "Lodging option removed"}


# --- Itinerary Items Sub-Endpoints ---

@router.post("/{trip_id}/itinerary", response_model=TripItineraryItemResponse, status_code=status.HTTP_201_CREATED)
def add_itinerary_item(
    trip_id: int,
    item_in: TripItineraryItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    item = TripItineraryItem(
        trip_id=trip_id,
        day_number=item_in.day_number,
        item_date=item_in.item_date,
        time_of_day=item_in.time_of_day,
        title=item_in.title,
        description=item_in.description,
        location=item_in.location,
        location_url=item_in.location_url,
        cost=item_in.cost,
        category=item_in.category,
        is_completed=item_in.is_completed,
        creator_id=current_user.id
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/{trip_id}/itinerary/{item_id}", response_model=TripItineraryItemResponse)
def update_itinerary_item(
    trip_id: int,
    item_id: int,
    item_in: TripItineraryItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(TripItineraryItem).filter(
        TripItineraryItem.id == item_id,
        TripItineraryItem.trip_id == trip_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Itinerary item not found")

    update_data = item_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(item, field, val)

    db.commit()
    db.refresh(item)
    return item

@router.delete("/{trip_id}/itinerary/{item_id}")
def delete_itinerary_item(
    trip_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    item = db.query(TripItineraryItem).filter(
        TripItineraryItem.id == item_id,
        TripItineraryItem.trip_id == trip_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Itinerary item not found")

    db.delete(item)
    db.commit()
    return {"message": "Itinerary item removed"}
