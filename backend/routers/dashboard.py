from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from services import DashboardService

router = APIRouter()


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    return DashboardService(db).get_dashboard()
