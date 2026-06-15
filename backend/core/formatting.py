from datetime import date, datetime
from decimal import Decimal

from core.config import APP_TIMEZONE


def initials(first_name: str, last_name: str) -> str:
    return f"{first_name[:1]}{last_name[:1]}".upper()


def avatar_tone(value: int) -> str:
    return ["rose", "amber", "blue", "peach"][value % 4]


def format_date(value: date | datetime | None) -> str:
    if value is None:
        return "Noch keine Teilnahme"
    return value.strftime("%d.%m.%Y")


def format_export_date(value: date | datetime | None) -> str:
    if value is None:
        return ""
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


def format_export_bool(value: bool | None) -> str:
    return "Ja" if value else "Nein"
