from datetime import datetime, timezone
from decimal import Decimal
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.models import GuestRecord
from app.utils import (
    address_label,
    avatar_tone,
    clean_optional,
    format_chf,
    format_date,
    format_time,
    initials,
    map_guest_search_result,
    month_label,
    normalize_guest_code,
    require_text,
    row_to_dict,
    verify_password,
)


def test_password_verification_supports_plain_text_fallback():
    assert verify_password("secret", "secret") is True
    assert verify_password("wrong", "secret") is False


def test_row_to_dict_reads_sqlalchemy_mapping_shape():
    row = SimpleNamespace(_mapping={"id": 1, "name": "Nina"})

    assert row_to_dict(row) == {"id": 1, "name": "Nina"}


def test_formatters_handle_empty_and_normal_values():
    assert initials("Nina", "Odermatt") == "NO"
    assert avatar_tone(5) == "amber"
    assert format_date(None) == "Noch keine Teilnahme"
    assert format_date(datetime(2026, 4, 7)) == "07.04.2026"
    assert format_time(None) is None
    assert format_time(datetime(2026, 4, 7, 17, 30)) == "17:30"
    assert format_time(datetime(2026, 4, 7, 15, 30, tzinfo=timezone.utc)) == "17:30"
    assert format_chf(None) == "CHF -"
    assert format_chf(Decimal("10")) == "CHF 10"
    assert format_chf("10.50") == "CHF 10.50"
    assert month_label(datetime(2026, 5, 1).date()) == "MAI"


def test_text_cleaners_validate_required_values():
    assert clean_optional(None) is None
    assert clean_optional("  ") is None
    assert clean_optional("  hello@example.ch ") == "hello@example.ch"
    assert require_text("  Nina  ", "firstName") == "Nina"

    with pytest.raises(HTTPException) as exc_info:
        require_text(" ", "firstName")

    assert exc_info.value.status_code == 422
    assert exc_info.value.detail == "firstName is required"


def test_normalize_guest_code_accepts_raw_codes_urls_and_rejects_empty_values():
    assert normalize_guest_code(" g-000123 ") == "G-000123"
    assert normalize_guest_code("/mobile/check-in/g-000777") == "G-000777"
    assert (
        normalize_guest_code("https://example.ch/mobile/register/confirmation?code=g-000456")
        == "G-000456"
    )

    with pytest.raises(HTTPException) as exc_info:
        normalize_guest_code(" ")

    assert exc_info.value.status_code == 422
    assert exc_info.value.detail == "Guest code is required"


def test_guest_result_mapping_sets_address_and_status():
    row = SimpleNamespace(
        id=4,
        first_name="Nina",
        last_name="Odermatt",
        guest_code="G-000004",
        street="Dorfstrasse",
        house_number="7",
        postal_code="6373",
        city="Ennetbuergen",
        checkin_id=9,
        checked_in_at=datetime(2026, 4, 7, 17, 45),
    )

    assert address_label(row) == "Dorfstrasse 7, 6373 Ennetbuergen"
    result = map_guest_search_result(row)
    assert result.model_dump() == {
        "id": "4",
        "name": "Nina Odermatt",
        "code": "G-000004",
        "address": "Dorfstrasse 7, 6373 Ennetbuergen",
        "status": "checked-in",
        "checkedInAt": "17:45",
    }


def test_guest_record_model_normalizes_row_shape():
    guest = GuestRecord.from_row(
        SimpleNamespace(
            id=12,
            guest_code="G-000012",
            first_name="Lia",
            last_name="Barmettler",
        )
    )

    assert guest.id == 12
    assert guest.guest_code == "G-000012"
    assert guest.name == "Lia Barmettler"
