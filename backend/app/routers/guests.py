from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas import (
    GuestRegistrationRequest,
    GuestRegistrationResponse,
    GuestSearchResult,
)
from app.services.guests import GuestService
from database import get_db

router = APIRouter(prefix="/guests", tags=["guests"])


@router.get("")
def get_guests(db: Session = Depends(get_db)) -> list[dict]:
    return GuestService(db).list_guests()


@router.post("", response_model=GuestRegistrationResponse)
def create_guest(
    payload: GuestRegistrationRequest,
    db: Session = Depends(get_db),
) -> GuestRegistrationResponse:
    return GuestService(db).create_guest(payload)


@router.get("/search", response_model=list[GuestSearchResult])
def search_guests(
    q: str = "",
    db: Session = Depends(get_db),
) -> list[GuestSearchResult]:
    return GuestService(db).search_guests(q)


@router.patch("/{guest_id}/marketing")
def update_guest_marketing(guest_id: int, db: Session = Depends(get_db)) -> dict:
    return GuestService(db).update_marketing(guest_id)
