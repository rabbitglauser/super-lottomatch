"""Utility functions for formatting and data transformation."""
from datetime import date, datetime
from decimal import Decimal
from typing import Any
from zoneinfo import ZoneInfo

APP_TIMEZONE = ZoneInfo("Europe/Zurich")


def row_to_dict(row: Any) -> dict[str, Any]:
    """Convert SQLAlchemy row to dictionary."""
    return dict(row._mapping)


def initials(first_name: str, last_name: str) -> str:
    """Generate initials from first and last name."""
    return f"{first_name[:1]}{last_name[:1]}".upper()


def avatar_tone(value: int) -> str:
    """Get avatar color tone based on a numeric value."""
    return ["rose", "amber", "blue", "peach"][value % 4]


def format_date(value: date | datetime | None) -> str:
    """Format a date or datetime value for display."""
    if value is None:
        return "Noch keine Teilnahme"
    if isinstance(value, datetime):
        value = value.date()
    return value.strftime("%d.%m.%Y")


def format_time(value: datetime | None) -> str | None:
    """Format a datetime value to time string."""
    if value is None:
        return None
    if value.tzinfo is not None:
        value = value.astimezone(APP_TIMEZONE)
    return value.strftime("%H:%M")


def format_chf(value: Decimal | int | float | str | None) -> str:
    """Format a monetary value as CHF."""
    if value is None:
        return "CHF -"
    amount = Decimal(str(value))
    if amount == amount.quantize(Decimal("1")):
        return f"CHF {amount:.0f}"
    return f"CHF {amount:.2f}"


def month_label(value: date) -> str:
    """Get German month label for a date."""
    labels = [
        "JAN", "FEB", "MAR", "APR",
        "MAI", "JUN", "JUL", "AUG",
        "SEP", "OKT", "NOV", "DEZ",
    ]
    return labels[value.month - 1]


def prize_category(title: str, description: str | None) -> str:
    """Categorize a prize based on its title and description."""
    text_value = f"{title} {description or ''}".lower()
    
    if any(keyword in text_value for keyword in ["hauptpreis", "reise", "e-bike"]):
        return "Hauptpreis"
    if "sport" in text_value:
        return "Sport"
    if any(keyword in text_value for keyword in ["gutschein", "ticket", "eintritt"]):
        return "Gutschein"
    if any(keyword in text_value for keyword in ["kaffee", "brunch", "korb"]):
        return "Genuss"
    
    return "Sachpreis"


def verify_password(password: str, stored_password: str) -> bool:
    """Verify a password against its hash."""
    import secrets
    
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
