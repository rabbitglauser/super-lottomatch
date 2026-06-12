from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.services.analytics import AnalyticsService
from database import get_db

router = APIRouter(tags=["analytics"])


@router.get("/analytics")
def get_analytics(db: Session = Depends(get_db)) -> dict:
    return AnalyticsService(db).get_analytics()
