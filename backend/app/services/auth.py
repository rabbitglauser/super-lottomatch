from fastapi import HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.schemas import LoginRequest, LoginResponse
from app.utils import verify_password


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def login(self, payload: LoginRequest) -> LoginResponse:
        normalized_email = payload.email.strip().lower()
        row = self.db.execute(
            text(
                """
                select id, first_name, last_name, email, password_hash
                from users
                where lower(email) = :email and is_active = true
                """
            ),
            {"email": normalized_email},
        ).first()

        if row is None or not verify_password(payload.password, row.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Ungültige Zugangsdaten",
            )

        return LoginResponse(
            id=row.id,
            name=f"{row.first_name} {row.last_name}",
            email=row.email,
        )
