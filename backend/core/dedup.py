"""Deterministic duplicate-guest detection.

Pure functions producing a 0-100 confidence score for whether two guest
records are the same person. No external dependencies and no AI — this is the
authoritative, explainable signal. AI enrichment (see services) is a separate,
opt-in concern layered on top.
"""

from difflib import SequenceMatcher

# Field weights must sum to 100 so the combined score lands in 0-100.
WEIGHT_NAME = 55
WEIGHT_EMAIL = 25
WEIGHT_CITY = 10
WEIGHT_PHONE = 10


def normalize(value: object) -> str:
    return str(value or "").strip().lower()


def _ratio(left: str, right: str) -> float:
    if not left or not right:
        return 0.0
    return SequenceMatcher(None, left, right).ratio()


def _digits(value: object) -> str:
    return "".join(ch for ch in str(value or "") if ch.isdigit())


def _field(record: object, name: str) -> object:
    if isinstance(record, dict):
        return record.get(name)
    return getattr(record, name, None)


def duplicate_confidence(left: object, right: object) -> tuple[int, list[str]]:
    """Return ``(confidence, reasons)`` for two guest records.

    ``confidence`` is an integer 0-100. ``reasons`` lists the human-readable
    signals that contributed, so a reviewer understands the score.
    """
    reasons: list[str] = []

    first_ratio = _ratio(
        normalize(_field(left, "first_name")),
        normalize(_field(right, "first_name")),
    )
    last_ratio = _ratio(
        normalize(_field(left, "last_name")),
        normalize(_field(right, "last_name")),
    )
    name_ratio = (first_ratio + last_ratio) / 2
    if name_ratio >= 0.85:
        reasons.append("Name nearly identical")
    score = WEIGHT_NAME * name_ratio

    left_email = normalize(_field(left, "email"))
    right_email = normalize(_field(right, "email"))
    if left_email and left_email == right_email:
        score += WEIGHT_EMAIL
        reasons.append("Identical email address")

    left_city = normalize(_field(left, "city"))
    right_city = normalize(_field(right, "city"))
    if left_city and left_city == right_city:
        score += WEIGHT_CITY
        reasons.append("Same city")

    left_phone = _digits(_field(left, "phone"))
    right_phone = _digits(_field(right, "phone"))
    if left_phone and left_phone == right_phone:
        score += WEIGHT_PHONE
        reasons.append("Same phone number")

    return round(min(score, 100)), reasons


def find_duplicate_pairs(
    guests: list[object], threshold: int = 70
) -> list[dict[str, object]]:
    """Return candidate duplicate pairs at or above ``threshold`` confidence.

    Results are sorted by descending confidence so the most likely duplicates
    surface first.
    """
    pairs: list[dict[str, object]] = []
    for i in range(len(guests)):
        for j in range(i + 1, len(guests)):
            confidence, reasons = duplicate_confidence(guests[i], guests[j])
            if confidence >= threshold:
                pairs.append(
                    {
                        "left": guests[i],
                        "right": guests[j],
                        "confidence": confidence,
                        "reasons": reasons,
                    }
                )

    pairs.sort(key=lambda pair: pair["confidence"], reverse=True)
    return pairs
