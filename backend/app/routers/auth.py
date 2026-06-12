from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas import LoginRequest, LoginResponse
from app.services.auth import AuthService
from database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    return AuthService(db).login(payload)
