from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas import CheckInByCodeRequest, CheckInByCodeResponse
from app.services.checkins import CheckInService
from database import get_db

router = APIRouter(prefix="/check-ins", tags=["check-ins"])


@router.get("")
def get_check_ins(
    event_day_id: int | None = None,
    db: Session = Depends(get_db),
) -> dict:
    return CheckInService(db).get_check_ins(event_day_id)


@router.post("/by-code", response_model=CheckInByCodeResponse)
def create_check_in_by_code(
    payload: CheckInByCodeRequest,
    db: Session = Depends(get_db),
) -> CheckInByCodeResponse:
    return CheckInService(db).create_check_in_by_code(payload)


@router.post("/{guest_id}")
def create_check_in(
    guest_id: int,
    event_day_id: int | None = None,
    db: Session = Depends(get_db),
) -> dict:
    return CheckInService(db).create_check_in(guest_id, event_day_id)
