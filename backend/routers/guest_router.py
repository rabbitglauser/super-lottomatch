from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db.database import get_db
from models.guest_model import Guest
from schema.guest_schema import CreateGuest, ReadGuest

router = APIRouter(prefix="/guests", tags=["Guests"])

@router.get("/", response_model=list[ReadGuest])
def list_guests(db: Session = Depends(get_db)):
    return db.query(Guest).all()


@router.get("/{guest_id}", response_model=ReadGuest)
def get_guest(guest_id: int, db: Session = Depends(get_db)):
    guest = db.query(Guest).filter(Guest.id == guest_id).first()
    if not guest:
        raise HTTPException(status_code=404, detail="Guest not found")
    return guest


@router.post("/", response_model=ReadGuest)
def create_guest(data: CreateGuest, db: Session = Depends(get_db)):
    guest = Guest(**data.model_dump())
    db.add(guest)
    db.commit()
    db.refresh(guest)
    return guest

@router.post("/import")
def import_guests(data: list[CreateGuest], db: Session = Depends(get_db)):
    guests = [Guest(**item.model_dump()) for item in data]
    db.add_all(guests)
    db.commit()
    for guest in guests:
        db.refresh(guest)
    return guests