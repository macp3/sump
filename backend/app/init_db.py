from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from app.core.database import engine, Base, SessionLocal
from app.core.config import settings
from app.core.security import get_password_hash
from app.models.user import User
from app.models.date_proposal import DateProposal
from app.models.calendar_event import CalendarEvent

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
            print("[INFO] Database initialized successfully with calendar events!")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
