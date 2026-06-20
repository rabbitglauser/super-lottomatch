"""Pure validation logic for raffle rule configuration.

These helpers contain no I/O so they can be unit-tested directly and reused
by the service layer. The service layer is responsible for translating the
raised ``ValueError`` into an HTTP response.
"""

from decimal import Decimal, InvalidOperation

ELIGIBILITY_ALL = "all"
ELIGIBILITY_CHECKED_IN = "checked_in"
ELIGIBILITY_OPTIONS = (ELIGIBILITY_ALL, ELIGIBILITY_CHECKED_IN)

ELIGIBILITY_LABELS = {
    ELIGIBILITY_ALL: "Alle registrierten Gäste",
    ELIGIBILITY_CHECKED_IN: "Nur eingecheckte Gäste",
}


def normalize_eligibility(value: str) -> str:
    """Return a known eligibility key or raise ``ValueError``."""
    cleaned = (value or "").strip().lower()
    if cleaned not in ELIGIBILITY_OPTIONS:
        allowed = ", ".join(ELIGIBILITY_OPTIONS)
        raise ValueError(f"eligibility must be one of: {allowed}")
    return cleaned


def normalize_value_chf(value: object) -> Decimal:
    """Coerce a prize value to a non-negative ``Decimal``."""
    try:
        amount = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as error:
        raise ValueError("value_chf must be a number") from error
    if amount < 0:
        raise ValueError("value_chf must not be negative")
    return amount


def validate_winner_count(winner_count: int, capacity: int) -> int:
    """Validate the winner count against the eligible guest capacity.

    ``capacity`` is the number of guests that could possibly win (the event's
    registered guest pool). A raffle can never have more distinct winners than
    eligible guests, so a configuration that exceeds it is rejected.
    """
    if not isinstance(winner_count, int) or isinstance(winner_count, bool):
        raise ValueError("winner_count must be an integer")
    if winner_count < 1:
        raise ValueError("winner_count must be at least 1")
    if capacity >= 0 and winner_count > capacity:
        raise ValueError(
            f"winner_count ({winner_count}) cannot exceed the eligible "
            f"guest capacity ({capacity})"
        )
    return winner_count


def validate_prize_config(
    *,
    title: str,
    winner_count: int,
    eligibility: str,
    value_chf: object,
    capacity: int,
) -> dict[str, object]:
    """Validate a full prize configuration and return cleaned values.

    Raises ``ValueError`` on the first invalid field so the caller can surface
    a single, actionable message.
    """
    cleaned_title = (title or "").strip()
    if not cleaned_title:
        raise ValueError("title is required")

    return {
        "title": cleaned_title,
        "winner_count": validate_winner_count(winner_count, capacity),
        "eligibility": normalize_eligibility(eligibility),
        "value_chf": normalize_value_chf(value_chf),
    }
