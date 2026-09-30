from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.core.database import engine, Base, SessionLocal
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User
from app.models.date_proposal import DateProposal
from app.models.calendar_event import CalendarEvent
from app.models.trip import Trip, TripTransport, TripLodging, TripItineraryItem
from app.models.cooking import FridgeItem, ShoppingItem, MealPlan
from app.models.photo import Photo

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

        # --- Seed Cooking: Fridge & Pantry Items ---
        if db.query(FridgeItem).count() == 0:
            first_user = db.query(User).first()
            if first_user:
                starter_fridge = [
                    FridgeItem(name="Parmigiano Reggiano", quantity="250g", category="dairy", storage_location="fridge", status="fresh", notes="Aged 24 months", creator_id=first_user.id),
                    FridgeItem(name="Fresh Basil", quantity="1 bunch", category="produce", storage_location="fridge", status="use_soon", notes="Keep in water glass", creator_id=first_user.id),
                    FridgeItem(name="Cherry Tomatoes", quantity="500g", category="produce", storage_location="fridge", status="fresh", creator_id=first_user.id),
                    FridgeItem(name="Burrata Pugliese", quantity="2 pcs", category="dairy", storage_location="fridge", status="fresh", creator_id=first_user.id),
                    FridgeItem(name="Garlic", quantity="1 bulb", category="produce", storage_location="pantry", status="fresh", creator_id=first_user.id),
                    FridgeItem(name="Barista Oat Milk", quantity="1L", category="drinks", storage_location="fridge", status="fresh", creator_id=first_user.id),
                    FridgeItem(name="Artisanal Sourdough", quantity="1 loaf", category="bakery", storage_location="pantry", status="use_soon", creator_id=first_user.id),
                ]
                db.add_all(starter_fridge)
                db.commit()
                print("[INFO] Seeded starter fridge and pantry items!")

        # --- Seed Cooking: Shopping List Items ---
        if db.query(ShoppingItem).count() == 0:
            first_user = db.query(User).first()
            if first_user:
                starter_shopping = [
                    ShoppingItem(name="Arborio Rice", quantity="1 kg", category="pantry", urgency="normal", notes="For Tuesday risotto", creator_id=first_user.id),
                    ShoppingItem(name="Shallots", quantity="4 pcs", category="produce", urgency="normal", creator_id=first_user.id),
                    ShoppingItem(name="Extra Virgin Olive Oil", quantity="750ml", category="pantry", urgency="high", notes="Cold pressed Italian", creator_id=first_user.id),
                    ShoppingItem(name="Wild Porcini Mushrooms", quantity="300g", category="produce", urgency="normal", creator_id=first_user.id),
                    ShoppingItem(name="Prosecco Valdobbiadene", quantity="1 bottle", category="drinks", urgency="normal", notes="Weekend celebration", creator_id=first_user.id),
                ]
                db.add_all(starter_shopping)
                db.commit()
                print("[INFO] Seeded starter shopping list items!")

        # --- Seed Cooking: Weekly Meal Plan ---
        if db.query(MealPlan).count() == 0:
            first_user = db.query(User).first()
            if first_user:
                starter_meals = [
                    MealPlan(
                        day_of_week="monday",
                        meal_type="dinner",
                        recipe_title="Handmade Tagliatelle with Cherry Tomatoes & Burrata",
                        chef="both",
                        prep_time_minutes=35,
                        status="accepted",
                        ingredients="Tagliatelle pasta, Cherry tomatoes, Garlic, Fresh basil, Burrata cheese, Olive oil",
                        notes="Fresh, simple, and comforting after Monday work.",
                        creator_id=first_user.id
                    ),
                    MealPlan(
                        day_of_week="tuesday",
                        meal_type="dinner",
                        recipe_title="Creamy Wild Mushroom Risotto",
                        chef="maciej",
                        prep_time_minutes=45,
                        status="proposed",
                        ingredients="Arborio rice, Wild mushrooms, Shallots, White wine, Vegetable broth, Parmigiano Reggiano, Butter",
                        notes="Slow-stirred arborio rice with rich mushroom reduction.",
                        creator_id=first_user.id
                    ),
                    MealPlan(
                        day_of_week="wednesday",
                        meal_type="dinner",
                        recipe_title="Lemon Herb Salmon & Roasted Asparagus",
                        chef="selina",
                        prep_time_minutes=30,
                        status="proposed",
                        ingredients="Salmon fillets, Asparagus, Lemon, Olive oil, Fresh dill, Garlic",
                        notes="Light and healthy mid-week dinner.",
                        creator_id=first_user.id
                    ),
                    MealPlan(
                        day_of_week="thursday",
                        meal_type="dinner",
                        recipe_title="Italian Bistro Promenade",
                        chef="dining_out",
                        status="proposed",
                        notes="Trying the newly opened quiet pasta place in old town.",
                        creator_id=first_user.id
                    ),
                    MealPlan(
                        day_of_week="friday",
                        meal_type="dinner",
                        recipe_title="Neapolitan Pizza Night",
                        chef="both",
                        prep_time_minutes=60,
                        status="accepted",
                        ingredients="Pizza dough, San Marzano tomato sauce, Mozzarella di bufala, Fresh basil, Olive oil",
                        notes="Friday tradition with cold drinks and favorite playlist.",
                        creator_id=first_user.id
                    ),
                    MealPlan(
                        day_of_week="saturday",
                        meal_type="dinner",
                        recipe_title="Slow-Cooked Tuscan Ragu & Chianti",
                        chef="both",
                        prep_time_minutes=90,
                        status="proposed",
                        ingredients="Beef chuck, Pancetta, Carrots, Celery, Onions, Red wine, Tagliatelle",
                        notes="Slow-simmered weekend culinary project.",
                        creator_id=first_user.id
                    ),
                    MealPlan(
                        day_of_week="sunday",
                        meal_type="breakfast",
                        recipe_title="Sunday Atelier Brunch Shakshuka",
                        chef="maciej",
                        prep_time_minutes=25,
                        status="proposed",
                        ingredients="Fresh eggs, Crushed tomatoes, Bell peppers, Feta cheese, Sourdough bread",
                        notes="Served directly in the cast-iron skillet with hot espresso.",
                        creator_id=first_user.id
                    )
                ]
                db.add_all(starter_meals)
                db.commit()
                print("[INFO] Seeded weekly meal plan proposals!")

        # --- Seed Starter Photos Collection ---
        if db.query(Photo).count() == 0:
            first_user = db.query(User).first()
            user_id = first_user.id if first_user else None
            starter_photos_data = [
                {"filename": "photo_01.jpg", "caption": "Shared Moments 01", "aspect": 0.75, "rot": -5},
                {"filename": "photo_02.jpg", "caption": "Shared Moments 02", "aspect": 0.75, "rot": 4},
                {"filename": "photo_03.jpg", "caption": "Shared Moments 03", "aspect": 0.56, "rot": 4},
                {"filename": "photo_04.jpg", "caption": "Shared Moments 04", "aspect": 0.56, "rot": -6},
                {"filename": "photo_05.jpg", "caption": "Shared Moments 05", "aspect": 0.75, "rot": -7},
                {"filename": "photo_06.jpg", "caption": "Shared Moments 06", "aspect": 1.33, "rot": 5},
                {"filename": "photo_07.jpg", "caption": "Shared Moments 07", "aspect": 0.45, "rot": 5},
                {"filename": "photo_08.jpg", "caption": "Shared Moments 08", "aspect": 0.56, "rot": -4},
                {"filename": "photo_09.jpg", "caption": "Shared Moments 09", "aspect": 0.75, "rot": -4},
                {"filename": "photo_10.jpg", "caption": "Shared Moments 10", "aspect": 0.81, "rot": 6},
                {"filename": "photo_11.jpg", "caption": "Shared Moments 11", "aspect": 0.75, "rot": -6},
                {"filename": "photo_12.jpg", "caption": "Shared Moments 12", "aspect": 0.75, "rot": 7},
                {"filename": "photo_13.jpg", "caption": "Shared Moments 13", "aspect": 0.75, "rot": -5},
                {"filename": "photo_14.jpg", "caption": "Shared Moments 14", "aspect": 0.75, "rot": 3},
                {"filename": "photo_15.jpg", "caption": "Shared Moments 15", "aspect": 0.75, "rot": -3},
                {"filename": "photo_16.jpg", "caption": "Shared Moments 16", "aspect": 0.75, "rot": 4},
                {"filename": "photo_17.jpg", "caption": "Shared Moments 17", "aspect": 1.33, "rot": 3},
                {"filename": "photo_18.jpg", "caption": "Shared Moments 18", "aspect": 1.00, "rot": -5},
                {"filename": "photo_19.jpg", "caption": "Shared Moments 19", "aspect": 1.33, "rot": -2},
                {"filename": "photo_20.jpg", "caption": "Shared Moments 20", "aspect": 0.75, "rot": 4},
            ]
            starter_photos = [
                Photo(
                    filename=p["filename"],
                    file_url=f"/collage/{p['filename']}",
                    original_name=p["filename"],
                    caption=p["caption"],
                    in_background=True,
                    aspect_ratio=p["aspect"],
                    rotation=p["rot"],
                    order_index=idx,
                    creator_id=user_id
                )
                for idx, p in enumerate(starter_photos_data)
            ]
            db.add_all(starter_photos)
            db.commit()
            print("[INFO] Seeded starter photo collection with 20 memories!")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
