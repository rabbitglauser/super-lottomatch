from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from services import AnalyticsService

router = APIRouter()


@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    return AnalyticsService(db).get_analytics()
