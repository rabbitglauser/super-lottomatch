from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.services.dashboard import DashboardService
from database import get_db

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)) -> dict:
    return DashboardService(db).get_dashboard()
