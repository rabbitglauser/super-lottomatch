from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import LoginRequest, LoginResponse
from services import AuthService

router = APIRouter()


@router.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    return AuthService(db).login(payload)
