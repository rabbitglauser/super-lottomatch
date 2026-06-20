from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from schemas import EventCreateRequest, EventCreateResponse
from services import EventService

router = APIRouter()


@router.post(
    "/events",
    response_model=EventCreateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_event(
    payload: EventCreateRequest,
    db: Session = Depends(get_db),
) -> EventCreateResponse:
    return EventService(db).create_event(payload)
