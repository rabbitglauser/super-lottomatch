from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from services import PrizeService

router = APIRouter()


@router.get("/prizes")
def get_prizes(db: Session = Depends(get_db)):
    return PrizeService(db).get_prizes()
