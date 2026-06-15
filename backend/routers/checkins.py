from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import CheckInByCodeRequest, CheckInByCodeResponse
from services import CheckInService

router = APIRouter()


@router.get("/check-ins")
def get_check_ins(
    event_day_id: int | None = None,
    db: Session = Depends(get_db),
):
    return CheckInService(db).get_check_ins(event_day_id)


@router.post("/check-ins/by-code", response_model=CheckInByCodeResponse)
def create_check_in_by_code(
    payload: CheckInByCodeRequest,
    db: Session = Depends(get_db),
) -> CheckInByCodeResponse:
    return CheckInService(db).create_by_code(payload)


@router.post("/check-ins/{guest_id}")
def create_check_in(
    guest_id: int,
    event_day_id: int | None = None,
    db: Session = Depends(get_db),
):
    return CheckInService(db).create_check_in(guest_id, event_day_id)
