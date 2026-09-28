from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.core.database import engine, Base, SessionLocal
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User
from app.models.date_proposal import DateProposal
from app.models.calendar_event import CalendarEvent
from app.models.trip import Trip, TripTransport, TripLodging, TripItineraryItem

def init_db():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Check if users already exist
        user_count = db.query(User).count()
        if user_count == 0:
            print("[INFO] Initializing database: creating couple accounts...")
            
            # User 1 (from environment configuration)
            user1 = User(
                username=settings.USER1_USERNAME.strip().lower(),
                display_name=settings.USER1_DISPLAY_NAME.strip(),
                hashed_password=get_password_hash(settings.USER1_INITIAL_PASSWORD),
                avatar_color="stone",
                current_mood="Looking forward to our upcoming plans."
            )
            
            # User 2 (from environment configuration)
            user2 = User(
                username=settings.USER2_USERNAME.strip().lower(),
                display_name=settings.USER2_DISPLAY_NAME.strip(),
                hashed_password=get_password_hash(settings.USER2_INITIAL_PASSWORD),
                avatar_color="amber",
                current_mood="Wishing you a productive and pleasant day."
            )
            
            db.add(user1)
            db.add(user2)
            db.commit()
            db.refresh(user1)
            db.refresh(user2)
            
            # Seed a sample starter date proposal
            tomorrow = datetime.now(timezone.utc) + timedelta(days=2, hours=4)
            sample_date = DateProposal(
                title="Fine Dining & Evening Promenade",
                description="Reserved a table at a quiet restaurant in the historic district. Dessert and an evening walk to follow.",
                category="food",
                location="The Glasshouse Restaurant",
                proposed_date=tomorrow,
                dress_code="Formal / Elegant",
                estimated_cost="$$$",
                status="proposed",
                creator_id=user1.id
            )
            db.add(sample_date)
            
            # Seed a sample calendar milestone event
            next_week = datetime.now(timezone.utc) + timedelta(days=7)
            sample_event = CalendarEvent(
                title="Weekend Cultural Excursion",
                description="Day trip to explore local architecture, exhibitions, and botanical gardens.",
                category="travel",
                event_date=next_week,
                is_all_day=True,
                creator_id=user1.id
            )
            db.add(sample_event)
            
            db.commit()
            print("[INFO] Database initialized successfully with couple accounts!")

        # Ensure starter sample trip exists
        if db.query(Trip).count() == 0:
            first_user = db.query(User).first()
            if first_user:
                trip_start = datetime.now(timezone.utc) + timedelta(days=35)
                trip_end = trip_start + timedelta(days=4)
                sample_trip = Trip(
                    title="Spring Italian Getaway",
                    destination="Rome & Amalfi Coast, Italy",
                    description="Exploring ancient cobbled streets, seaside cliffs, authentic trattorias, and sunset views.",
                    start_date=trip_start,
                    end_date=trip_end,
                    status="planning",
                    estimated_budget=1200.0,
                    currency="EUR",
                    notes="Pack comfortable walking shoes, sunglasses, and camera gear.",
                    creator_id=first_user.id
                )
                db.add(sample_trip)
                db.commit()
                db.refresh(sample_trip)

                # Add sample transport options
                flight1 = TripTransport(
                    trip_id=sample_trip.id,
                    type="flight",
                    title="Direct Morning Flight",
                    departure_location="Warsaw Chopin (WAW)",
                    arrival_location="Rome Fiumicino (FCO)",
                    departure_time=trip_start + timedelta(hours=6),
                    arrival_time=trip_start + timedelta(hours=8, minutes=30),
                    cost=165.0,
                    booking_reference="W6 1421",
                    booking_url="https://wizzair.com",
                    is_selected=True,
                    notes="Carry-on baggage and adjacent seats included",
                    creator_id=first_user.id
                )
                train1 = TripTransport(
                    trip_id=sample_trip.id,
                    type="train",
                    title="Frecciarossa High-Speed Rail",
                    departure_location="Roma Termini",
                    arrival_location="Napoli Centrale",
                    departure_time=trip_start + timedelta(days=2, hours=10),
                    arrival_time=trip_start + timedelta(days=2, hours=11, minutes=15),
                    cost=45.0,
                    booking_url="https://trenitalia.com",
                    is_selected=True,
                    notes="Scenic coastal express train",
                    creator_id=first_user.id
                )
                db.add(flight1)
                db.add(train1)

                # Add sample lodging options
                lodging1 = TripLodging(
                    trip_id=sample_trip.id,
                    type="hotel",
                    name="Boutique Hotel Navona",
                    location="Via dei Coronari 12, Rome",
                    check_in=trip_start,
                    check_out=trip_start + timedelta(days=2),
                    cost=240.0,
                    booking_url="https://booking.com",
                    is_selected=True,
                    notes="Rooftop terrace overlooking ancient terracotta roofs, breakfast included",
                    creator_id=first_user.id
                )
                lodging2 = TripLodging(
                    trip_id=sample_trip.id,
                    type="airbnb",
                    name="Cliffside Positano Villa",
                    location="Positano, Amalfi Coast",
                    check_in=trip_start + timedelta(days=2),
                    check_out=trip_end,
                    cost=340.0,
                    booking_url="https://airbnb.com",
                    is_selected=True,
                    notes="Panoramic private balcony with direct Tyrrhenian Sea view",
                    creator_id=first_user.id
                )
                db.add(lodging1)
                db.add(lodging2)

                # Add sample itinerary items
                item1 = TripItineraryItem(
                    trip_id=sample_trip.id,
                    day_number=1,
                    item_date=trip_start,
                    time_of_day="11:30 AM",
                    title="Check-in & Espresso at Piazza Navona",
                    description="Unpack at the hotel, take our inaugural Roman promenade, and enjoy artisan gelato.",
                    location="Piazza Navona, Rome",
                    cost=15.0,
                    category="food",
                    creator_id=first_user.id
                )
                item2 = TripItineraryItem(
                    trip_id=sample_trip.id,
                    day_number=1,
                    item_date=trip_start,
                    time_of_day="07:00 PM",
                    title="Trevi Fountain Sunset & Trastevere Osteria",
                    description="Atmospheric dinner at a traditional family-owned osteria serving handmade pasta.",
                    location="Trastevere, Rome",
                    cost=65.0,
                    category="food",
                    creator_id=first_user.id
                )
                item3 = TripItineraryItem(
                    trip_id=sample_trip.id,
                    day_number=2,
                    item_date=trip_start + timedelta(days=1),
                    time_of_day="09:30 AM",
                    title="Colosseum & Roman Forum Exploration",
                    description="Guided morning tour exploring classical Roman architecture and monuments.",
                    location="Piazza del Colosseo",
                    cost=40.0,
                    category="sightseeing",
                    creator_id=first_user.id
                )
                db.add(item1)
                db.add(item2)
                db.add(item3)
                db.commit()
                print("[INFO] Seeded sample trip 'Spring Italian Getaway' with travel details!")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
