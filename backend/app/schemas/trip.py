from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.schemas.user import UserResponse

# --- Transport Schemas ---
class TripTransportBase(BaseModel):
    type: str = "flight"  # flight, train, car, bus, ferry, other
    title: str
    departure_location: Optional[str] = None
    arrival_location: Optional[str] = None
    departure_time: Optional[datetime] = None
    arrival_time: Optional[datetime] = None
    cost: float = 0.0
    booking_reference: Optional[str] = None
    booking_url: Optional[str] = None
    is_selected: bool = False
    notes: Optional[str] = None

class TripTransportCreate(TripTransportBase):
    pass

class TripTransportUpdate(BaseModel):
    type: Optional[str] = None
    title: Optional[str] = None
    departure_location: Optional[str] = None
    arrival_location: Optional[str] = None
    departure_time: Optional[datetime] = None
    arrival_time: Optional[datetime] = None
    cost: Optional[float] = None
    booking_reference: Optional[str] = None
    booking_url: Optional[str] = None
    is_selected: Optional[bool] = None
    notes: Optional[str] = None

class TripTransportResponse(TripTransportBase):
    id: int
    trip_id: int
    creator_id: int
    created_at: datetime
    creator: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# --- Lodging Schemas ---
class TripLodgingBase(BaseModel):
    type: str = "hotel"  # hotel, airbnb, apartment, resort, hostel, other
    name: str
    location: Optional[str] = None
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    cost: float = 0.0
    booking_url: Optional[str] = None
    is_selected: bool = False
    notes: Optional[str] = None

class TripLodgingCreate(TripLodgingBase):
    pass

class TripLodgingUpdate(BaseModel):
    type: Optional[str] = None
    name: Optional[str] = None
    location: Optional[str] = None
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    cost: Optional[float] = None
    booking_url: Optional[str] = None
    is_selected: Optional[bool] = None
    notes: Optional[str] = None

class TripLodgingResponse(TripLodgingBase):
    id: int
    trip_id: int
    creator_id: int
    created_at: datetime
    creator: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# --- Itinerary Item Schemas ---
class TripItineraryItemBase(BaseModel):
    day_number: int = 1
    item_date: Optional[datetime] = None
    time_of_day: Optional[str] = None
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    location_url: Optional[str] = None
    cost: float = 0.0
    category: str = "sightseeing"  # sightseeing, food, relax, adventure, culture, transport
    is_completed: bool = False

class TripItineraryItemCreate(TripItineraryItemBase):
    pass

class TripItineraryItemUpdate(BaseModel):
    day_number: Optional[int] = None
    item_date: Optional[datetime] = None
    time_of_day: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    location_url: Optional[str] = None
    cost: Optional[float] = None
    category: Optional[str] = None
    is_completed: Optional[bool] = None

class TripItineraryItemResponse(TripItineraryItemBase):
    id: int
    trip_id: int
    creator_id: int
    created_at: datetime
    creator: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# --- Trip Schemas ---
class TripBase(BaseModel):
    destination: str
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: str = "idea"  # idea, planning, booked, completed
    estimated_budget: float = 0.0
    currency: str = "EUR"
    notes: Optional[str] = None

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    title: Optional[str] = None
    destination: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    status: Optional[str] = None
    estimated_budget: Optional[float] = None
    currency: Optional[str] = None
    notes: Optional[str] = None

class TripResponse(TripBase):
    id: int
    creator_id: int
    created_at: datetime
    updated_at: datetime
    creator: Optional[UserResponse] = None
    transports: List[TripTransportResponse] = []
    lodgings: List[TripLodgingResponse] = []
    itinerary_items: List[TripItineraryItemResponse] = []

    class Config:
        from_attributes = True
