from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from core.config import GUEST_EXPORT_FILENAME
from database import get_db
from schemas import GuestRegistrationRequest, GuestRegistrationResponse
from schemas import GuestSearchResult
from services import GuestService

router = APIRouter()


@router.get("/guests")
def get_guests(db: Session = Depends(get_db)):
    return GuestService(db).list_guests()


@router.get("/guests/export")
def export_guests(db: Session = Depends(get_db)):
    return Response(
        content=GuestService(db).export_csv(),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": (f'attachment; filename="{GUEST_EXPORT_FILENAME}"')
        },
    )


@router.post("/guests", response_model=GuestRegistrationResponse)
def create_guest(
    payload: GuestRegistrationRequest,
    db: Session = Depends(get_db),
) -> GuestRegistrationResponse:
    return GuestService(db).create_guest(payload)


@router.get("/guests/search", response_model=list[GuestSearchResult])
def search_guests(
    q: str = "",
    db: Session = Depends(get_db),
) -> list[GuestSearchResult]:
    return GuestService(db).search_guests(q)


@router.patch("/guests/{guest_id}/marketing")
def update_guest_marketing(guest_id: int, db: Session = Depends(get_db)):
    return GuestService(db).update_marketing(guest_id)
