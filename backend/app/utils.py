import secrets
from datetime import date, datetime
from decimal import Decimal
from typing import Any
from urllib.parse import parse_qs, urlparse

from fastapi import HTTPException

from app.config import APP_TIMEZONE
from app.models import GuestRecord
from app.schemas import GuestSearchResult


def verify_password(password: str, stored_password: str) -> bool:
    if stored_password.startswith(("$2a$", "$2b$", "$2y$")):
        try:
            import bcrypt
        except ImportError:
            return False

        return bcrypt.checkpw(
            password.encode("utf-8"),
            stored_password.encode("utf-8"),
        )

    return secrets.compare_digest(stored_password, password)


def row_to_dict(row: Any) -> dict[str, Any]:
    return dict(row._mapping)


def initials(first_name: str, last_name: str) -> str:
    return f"{first_name[:1]}{last_name[:1]}".upper()


def avatar_tone(value: int) -> str:
    return ["rose", "amber", "blue", "peach"][value % 4]


def format_date(value: date | datetime | None) -> str:
    if value is None:
        return "Noch keine Teilnahme"
    return value.strftime("%d.%m.%Y")


def format_time(value: datetime | None) -> str | None:
    if value is None:
        return None
    if value.tzinfo is not None:
        value = value.astimezone(APP_TIMEZONE)
    return value.strftime("%H:%M")


def format_chf(value: Decimal | int | float | str | None) -> str:
    if value is None:
        return "CHF -"
    amount = Decimal(str(value))
    if amount == amount.quantize(Decimal("1")):
        return f"CHF {amount:.0f}"
    return f"CHF {amount:.2f}"


def month_label(value: date) -> str:
    labels = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAI",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OKT",
        "NOV",
        "DEZ",
    ]
    return labels[value.month - 1]


def clean_optional(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned if cleaned else None


def require_text(value: str, field_name: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise HTTPException(status_code=422, detail=f"{field_name} is required")
    return cleaned


def normalize_guest_code(value: str) -> str:
    cleaned = value.strip()
    if not cleaned:
        raise HTTPException(status_code=422, detail="Guest code is required")

    if "://" in cleaned or cleaned.startswith("/"):
        parsed = urlparse(cleaned)
        query_code = parse_qs(parsed.query).get("code", [None])[0]
        if query_code:
            return query_code.strip().upper()
        path_code = parsed.path.rstrip("/").split("/")[-1]
        if path_code:
            return path_code.strip().upper()

    return cleaned.strip().upper()


def address_label(row: Any) -> str:
    return f"{row.street} {row.house_number}, {row.postal_code} {row.city}"


def map_guest_search_result(row: Any) -> GuestSearchResult:
    guest = GuestRecord.from_row(row)
    checked_in_at = format_time(row.checked_in_at)
    return GuestSearchResult(
        id=str(guest.id),
        name=guest.name,
        code=guest.guest_code,
        address=address_label(row),
        status="checked-in" if row.checkin_id else "expected",
        checkedInAt=checked_in_at,
    )
