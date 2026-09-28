from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    destination = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    status = Column(String(30), default="idea", index=True)  # idea, planning, booked, completed
    estimated_budget = Column(Float, default=0.0)
    currency = Column(String(10), default="EUR")
    notes = Column(Text, nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    creator = relationship("User", foreign_keys=[creator_id])
    transports = relationship("TripTransport", back_populates="trip", cascade="all, delete-orphan", order_by="TripTransport.departure_time.asc()")
    lodgings = relationship("TripLodging", back_populates="trip", cascade="all, delete-orphan", order_by="TripLodging.check_in.asc()")
    itinerary_items = relationship("TripItineraryItem", back_populates="trip", cascade="all, delete-orphan", order_by="TripItineraryItem.day_number.asc()")


class TripTransport(Base):
    __tablename__ = "trip_transports"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(30), default="flight")  # flight, train, car, bus, ferry, other
    title = Column(String(150), nullable=False)
    departure_location = Column(String(150), nullable=True)
    arrival_location = Column(String(150), nullable=True)
    departure_time = Column(DateTime, nullable=True)
    arrival_time = Column(DateTime, nullable=True)
    cost = Column(Float, default=0.0)
    booking_reference = Column(String(100), nullable=True)
    booking_url = Column(String(500), nullable=True)
    is_selected = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    trip = relationship("Trip", back_populates="transports")
    creator = relationship("User", foreign_keys=[creator_id])


class TripLodging(Base):
    __tablename__ = "trip_lodgings"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(30), default="hotel")  # hotel, airbnb, apartment, resort, hostel, other
    name = Column(String(150), nullable=False)
    location = Column(String(200), nullable=True)
    check_in = Column(DateTime, nullable=True)
    check_out = Column(DateTime, nullable=True)
    cost = Column(Float, default=0.0)
    booking_url = Column(String(500), nullable=True)
    is_selected = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    trip = relationship("Trip", back_populates="lodgings")
    creator = relationship("User", foreign_keys=[creator_id])


class TripItineraryItem(Base):
    __tablename__ = "trip_itinerary_items"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    day_number = Column(Integer, default=1)
    item_date = Column(DateTime, nullable=True)
    time_of_day = Column(String(50), nullable=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String(150), nullable=True)
    location_url = Column(String(500), nullable=True)
    cost = Column(Float, default=0.0)
    category = Column(String(50), default="sightseeing")  # sightseeing, food, relax, adventure, culture, transport
    is_completed = Column(Boolean, default=False)
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    trip = relationship("Trip", back_populates="itinerary_items")
    creator = relationship("User", foreign_keys=[creator_id])
