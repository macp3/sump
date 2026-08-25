from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import random
from app.core.database import get_db
from app.models.date_proposal import DateProposal
from app.models.user import User
from app.schemas.date_proposal import (
    DateProposalCreate,
    DateProposalUpdate,
    DateProposalRespond,
    DateProposalComplete,
    DateProposalResponse,
    DateIdeaIdea
)
from app.routers.deps import get_current_user

router = APIRouter(prefix="/dates", tags=["Dates"])

# Curated bank of elegant date ideas (No emojis, refined smart elegance phrasing)
DATE_IDEAS = [
    {
        "title": "Private Culinary Evening & Cinema",
        "category": "home",
        "description": "Preparing a bespoke sushi dinner together with curated background music, followed by a private screening.",
        "dress_code": "Casual & Comfortable",
        "estimated_cost": "$$"
    },
    {
        "title": "Evening Promenade & Artisan Tasting",
        "category": "romantic",
        "description": "A quiet walk through historic architecture with a stop at a specialty chocolate and pastry atelier.",
        "dress_code": "Smart Casual",
        "estimated_cost": "$"
    },
    {
        "title": "Handcrafted Pasta & Wine Pairing",
        "category": "food",
        "description": "Crafting fresh handmade pasta accompanied by a curated wine selection in a candlelit setting.",
        "dress_code": "Smart Casual",
        "estimated_cost": "$$"
    },
    {
        "title": "Golden Hour Scenic Picnic",
        "category": "outdoors",
        "description": "An artisanal picnic basket with aged cheeses, fresh fruit, and sparkling water at a secluded viewpoint.",
        "dress_code": "Relaxed Elegance",
        "estimated_cost": "$"
    },
    {
        "title": "Strategy & Board Game Salon",
        "category": "home",
        "description": "An evening dedicated to strategic board games, specialty teas, and friendly competition.",
        "dress_code": "Casual Lounge",
        "estimated_cost": "Complimentary"
    },
    {
        "title": "Tasting Menu at a Premier Restaurant",
        "category": "food",
        "description": "Experiencing a multi-course seasonal tasting menu at a newly discovered fine dining venue.",
        "dress_code": "Cocktail / Formal",
        "estimated_cost": "$$$"
    },
    {
        "title": "Stargazing Expedition",
        "category": "adventure",
        "description": "A drive to a secluded dark-sky observatory point equipped with warm beverages and celestial charts.",
        "dress_code": "Warm Outdoor Layers",
        "estimated_cost": "$"
    },
    {
        "title": "Wellness & Thermal Suite Day",
        "category": "romantic",
        "description": "A rejuvenating afternoon of thermal pools, aromatherapy saunas, and restorative relaxation.",
        "dress_code": "Spa & Resort Wear",
        "estimated_cost": "$$$"
    },
    {
        "title": "Specialty Coffee & Literary Crawl",
        "category": "romantic",
        "description": "Visiting a renowned specialty coffee roastery followed by browsing rare bookshops.",
        "dress_code": "Contemporary Smart Casual",
        "estimated_cost": "$"
    }
]

def format_date_for_user(date_item: DateProposal, current_user_id: int) -> DateProposal:
    # If it's a surprise not created by current user and not yet revealed, mask the secret details
    if date_item.is_surprise and not date_item.surprise_revealed and date_item.creator_id != current_user_id:
        masked = DateProposal(
            id=date_item.id,
            title="Private Surprise Itinerary",
            description="Details for this event are kept confidential. The full itinerary will be revealed prior to departure.",
            category="surprise",
            location="Confidential Location",
            location_url=None,
            proposed_date=date_item.proposed_date,
            dress_code=date_item.dress_code,
            estimated_cost=date_item.estimated_cost,
            is_surprise=True,
            surprise_revealed=False,
            status=date_item.status,
            creator_id=date_item.creator_id,
            creator=date_item.creator,
            response_note=date_item.response_note,
            rating=date_item.rating,
            memory_notes=date_item.memory_notes,
            created_at=date_item.created_at,
            updated_at=date_item.updated_at
        )
        return masked
    return date_item

@router.get("", response_model=List[DateProposalResponse])
def get_dates(
    status_filter: Optional[str] = Query(None, alias="status"),
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(DateProposal)
    
    if status_filter and status_filter != "all":
        query = query.filter(DateProposal.status == status_filter)
        
    if category and category != "all":
        query = query.filter(DateProposal.category == category)
        
    dates = query.order_by(DateProposal.proposed_date.asc()).all()
    return [format_date_for_user(d, current_user.id) for d in dates]

@router.get("/random-idea", response_model=DateIdeaIdea)
def get_random_date_idea(current_user: User = Depends(get_current_user)):
    return random.choice(DATE_IDEAS)

@router.get("/ideas", response_model=List[DateIdeaIdea])
def get_all_date_ideas(current_user: User = Depends(get_current_user)):
    return DATE_IDEAS

@router.post("", response_model=DateProposalResponse, status_code=status.HTTP_201_CREATED)
def create_date(
    date_in: DateProposalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_date = DateProposal(
        title=date_in.title,
        description=date_in.description,
        category=date_in.category,
        location=date_in.location,
        location_url=date_in.location_url,
        proposed_date=date_in.proposed_date,
        dress_code=date_in.dress_code,
        estimated_cost=date_in.estimated_cost,
        is_surprise=date_in.is_surprise,
        surprise_revealed=False,
        status="proposed",
        creator_id=current_user.id
    )
    db.add(db_date)
    db.commit()
    db.refresh(db_date)
    return db_date

@router.get("/{date_id}", response_model=DateProposalResponse)
def get_date_details(
    date_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_date = db.query(DateProposal).filter(DateProposal.id == date_id).first()
    if not db_date:
        raise HTTPException(status_code=404, detail="Date proposal not found")
    return format_date_for_user(db_date, current_user.id)

@router.put("/{date_id}", response_model=DateProposalResponse)
def update_date(
    date_id: int,
    date_in: DateProposalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_date = db.query(DateProposal).filter(DateProposal.id == date_id).first()
    if not db_date:
        raise HTTPException(status_code=404, detail="Date proposal not found")
        
    update_data = date_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_date, field, value)
        
    db.commit()
    db.refresh(db_date)
    return format_date_for_user(db_date, current_user.id)

@router.post("/{date_id}/respond", response_model=DateProposalResponse)
def respond_to_date(
    date_id: int,
    response_in: DateProposalRespond,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_date = db.query(DateProposal).filter(DateProposal.id == date_id).first()
    if not db_date:
        raise HTTPException(status_code=404, detail="Date proposal not found")
        
    if response_in.status not in ["accepted", "declined"]:
        raise HTTPException(status_code=400, detail="Invalid response status")
        
    db_date.status = response_in.status
    if response_in.response_note is not None:
        db_date.response_note = response_in.response_note
        
    db.commit()
    db.refresh(db_date)
    return format_date_for_user(db_date, current_user.id)

@router.post("/{date_id}/complete", response_model=DateProposalResponse)
def complete_date(
    date_id: int,
    complete_in: DateProposalComplete,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_date = db.query(DateProposal).filter(DateProposal.id == date_id).first()
    if not db_date:
        raise HTTPException(status_code=404, detail="Date proposal not found")
        
    db_date.status = "completed"
    if complete_in.rating is not None:
        db_date.rating = complete_in.rating
    if complete_in.memory_notes is not None:
        db_date.memory_notes = complete_in.memory_notes
        
    db.commit()
    db.refresh(db_date)
    return format_date_for_user(db_date, current_user.id)

@router.post("/{date_id}/reveal", response_model=DateProposalResponse)
def reveal_surprise(
    date_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_date = db.query(DateProposal).filter(DateProposal.id == date_id).first()
    if not db_date:
        raise HTTPException(status_code=404, detail="Date proposal not found")
        
    db_date.surprise_revealed = True
    db.commit()
    db.refresh(db_date)
    return db_date

@router.delete("/{date_id}")
def delete_date(
    date_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_date = db.query(DateProposal).filter(DateProposal.id == date_id).first()
    if not db_date:
        raise HTTPException(status_code=404, detail="Date proposal not found")
        
    db.delete(db_date)
    db.commit()
    return {"message": "Date proposal deleted"}
