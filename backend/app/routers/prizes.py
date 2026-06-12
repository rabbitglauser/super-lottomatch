from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.services.prizes import PrizeService
from database import get_db

router = APIRouter(tags=["prizes"])


@router.get("/prizes")
def get_prizes(db: Session = Depends(get_db)) -> dict:
    return PrizeService(db).get_prizes()
