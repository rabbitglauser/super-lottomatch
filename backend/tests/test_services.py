from datetime import date, datetime
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.schemas import CheckInByCodeRequest, GuestRegistrationRequest
from app.services.analytics import AnalyticsService
from app.services.checkins import CheckInService
from app.services.dashboard import DashboardService
from app.services.events import EventService
from app.services.guests import GuestService
from app.services.prizes import PrizeService


class FakeResult:
    def __init__(self, *, first=None, rows=None, scalar=None):
        self._first = first
        self._rows = rows if rows is not None else []
        self._scalar = scalar

    def first(self):
        return self._first

    def all(self):
        return self._rows

    def scalar_one(self):
        return self._scalar


class FakeDb:
    def __init__(self, *results):
        self.results = list(results)
        self.calls = []
        self.commits = 0

    def execute(self, statement, params=None):
        self.calls.append({"sql": str(statement), "params": params})
        if not self.results:
            raise AssertionError("No fake result queued for SQL execution")
        return self.results.pop(0)

    def commit(self):
        self.commits += 1


def row(**kwargs):
    return SimpleNamespace(**kwargs)


def result(*, first=None, rows=None, scalar=None):
    return FakeResult(first=first, rows=rows, scalar=scalar)


def event_row(**overrides):
    values = {
        "id": 10,
        "name": "Lottomatch 2026",
        "event_year": 2026,
        "location": None,
        "start_date": date(2026, 4, 6),
        "end_date": date(2026, 4, 7),
    }
    values.update(overrides)
    return row(**values)


def day_row(**overrides):
    values = {
        "id": 20,
        "event_id": 10,
        "day_number": 2,
        "event_date": date(2026, 4, 7),
        "checkin_open_at": datetime(2026, 4, 7, 16, 0),
        "checkin_close_at": datetime(2026, 4, 7, 23, 0),
    }
    values.update(overrides)
    return row(**values)


def guest_row(**overrides):
    values = {
        "id": 1,
        "guest_code": "G-000001",
        "first_name": "Nina",
        "last_name": "Odermatt",
        "email": "nina@example.ch",
        "street": "Dorfstrasse",
        "house_number": "7",
        "postal_code": "6373",
        "city": "Ennetbuergen",
        "allow_email_marketing": False,
        "allow_post_marketing": True,
        "last_participation": datetime(2026, 4, 7, 17, 0),
        "checkin_id": None,
        "checked_in_at": None,
    }
    values.update(overrides)
    return row(**values)


def test_event_service_returns_latest_event_and_raises_when_missing():
    service = EventService(FakeDb(result(first=event_row())))
    assert service.latest_event().name == "Lottomatch 2026"

    with pytest.raises(HTTPException) as exc_info:
        EventService(FakeDb(result(first=None))).latest_event()

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "No Lottomatch event found"


def test_event_service_returns_latest_day_and_raises_when_missing():
    service = EventService(FakeDb(result(first=day_row())))
    assert service.latest_event_day(10).id == 20

    with pytest.raises(HTTPException) as exc_info:
        EventService(FakeDb(result(first=None))).latest_event_day(10)

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "No event day found"


def test_dashboard_service_builds_dashboard_payload():
    db = FakeDb(
        result(first=event_row()),
        result(first=day_row()),
        result(scalar=100),
        result(scalar=25),
        result(scalar=20),
        result(scalar=25),
        result(
            rows=[
                day_row(id=19, day_number=1, event_date=date(2026, 4, 6), checkins=30),
                day_row(id=20, day_number=2, checkins=25),
            ]
        ),
    )

    payload = DashboardService(db).get_dashboard()

    assert payload["stats"][0]["value"] == "100"
    assert payload["stats"][0]["delta"] == "+25%"
    assert payload["stats"][1]["progress"] == 25
    assert payload["eventDays"][1]["active"] is True
    assert payload["location"]["locationLabel"] == "Mehrzweckhalle Ennetbürgen"


def test_guest_service_lists_registered_guests():
    db = FakeDb(result(rows=[guest_row(email=None, id=5)]))

    guests = GuestService(db).list_guests()

    assert guests == [
        {
            "id": "5",
            "name": "Nina Odermatt",
            "email": "Keine E-Mail hinterlegt",
            "code": "G-000001",
            "city": "Ennetbuergen",
            "lastParticipation": "07.04.2026",
            "marketingActive": True,
            "initials": "NO",
            "avatarTone": "amber",
        }
    ]


def test_guest_service_creates_guest(monkeypatch):
    monkeypatch.setattr("app.services.guests.secrets.randbelow", lambda _limit: 123)
    db = FakeDb(
        result(first=row(id=8)),
        result(first=None),
        result(first=guest_row(id=9, guest_code="G-000123")),
    )
    payload = GuestRegistrationRequest(
        firstName=" Nina ",
        lastName=" Odermatt ",
        street=" Dorfstrasse ",
        houseNumber=" 7 ",
        postalCode=" 6373 ",
        city=" Ennetbuergen ",
        phone=" ",
        email=" nina@example.ch ",
        allowEmailMarketing=True,
        allowPostMarketing=False,
        notes=" VIP ",
    )

    created = GuestService(db).create_guest(payload)

    assert created.model_dump() == {
        "id": "9",
        "guestCode": "G-000123",
        "name": "Nina Odermatt",
    }
    assert db.commits == 1
    assert db.calls[2]["params"]["phone"] is None
    assert db.calls[2]["params"]["notes"] == "VIP"


def test_guest_service_rejects_unsaved_address_and_duplicate_codes(monkeypatch):
    payload = GuestRegistrationRequest(
        firstName="Nina",
        lastName="Odermatt",
        street="Dorfstrasse",
        houseNumber="7",
        postalCode="6373",
        city="Ennetbuergen",
    )

    with pytest.raises(HTTPException) as address_error:
        GuestService(FakeDb(result(first=None))).create_guest(payload)

    assert address_error.value.status_code == 500
    assert address_error.value.detail == "Address could not be saved"

    monkeypatch.setattr("app.services.guests.secrets.randbelow", lambda _limit: 123)
    duplicate_results = [result(first=row(exists=1)) for _ in range(10)]

    with pytest.raises(HTTPException) as code_error:
        GuestService(FakeDb(*duplicate_results)).generate_guest_code()

    assert code_error.value.status_code == 500
    assert code_error.value.detail == "Guest code could not be generated"


def test_guest_service_searches_and_updates_marketing():
    db = FakeDb(
        result(first=event_row()),
        result(first=day_row()),
        result(rows=[guest_row(checkin_id=11, checked_in_at=datetime(2026, 4, 7, 18, 0))]),
        result(first=row(id=1, allow_email_marketing=True)),
    )

    service = GuestService(db)

    assert service.search_guests("n") == []

    results = service.search_guests(" Nina ")
    assert results[0].status == "checked-in"
    assert results[0].checkedInAt == "18:00"
    assert service.update_marketing(1) == {"id": "1", "marketingActive": True}
    assert db.commits == 1


def test_guest_service_update_marketing_raises_for_missing_guest():
    with pytest.raises(HTTPException) as exc_info:
        GuestService(FakeDb(result(first=None))).update_marketing(999)

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Guest not found"


def test_checkin_service_lists_checkins_for_explicit_day():
    db = FakeDb(
        result(first=day_row(id=30)),
        result(
            rows=[
                guest_row(id=1, checkin_id=91, checked_in_at=datetime(2026, 4, 7, 18, 5)),
                guest_row(id=2, first_name="Lia", checkin_id=None, checked_in_at=None),
            ]
        ),
    )

    payload = CheckInService(db).get_check_ins(event_day_id=30)

    assert payload["eventDayId"] == "30"
    assert payload["summary"] == {
        "total": 2,
        "checkedIn": 1,
        "expected": 1,
        "noShow": 0,
    }
    assert payload["guests"][0]["status"] == "checked-in"


def test_checkin_service_rejects_missing_event_day():
    with pytest.raises(HTTPException) as exc_info:
        CheckInService(FakeDb(result(first=None))).get_check_ins(event_day_id=999)

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Event day not found"


def test_checkin_by_code_creates_new_checkin():
    db = FakeDb(
        result(first=event_row()),
        result(first=day_row()),
        result(first=guest_row()),
        result(first=row(id=100, checked_in_at=datetime(2026, 4, 7, 18, 15))),
    )

    payload = CheckInService(db).create_check_in_by_code(
        CheckInByCodeRequest(code="g-000001", method="qr_code")
    )

    assert payload.status == "checked-in"
    assert payload.id == "100"
    assert payload.guest.status == "checked-in"
    assert db.commits == 1


def test_checkin_by_code_returns_existing_checkin_without_commit():
    db = FakeDb(
        result(first=event_row()),
        result(first=day_row()),
        result(
            first=guest_row(
                checkin_id=101,
                checked_in_at=datetime(2026, 4, 7, 18, 30),
            )
        ),
    )

    payload = CheckInService(db).create_check_in_by_code(CheckInByCodeRequest(code="g-1"))

    assert payload.status == "already-checked-in"
    assert payload.id == "101"
    assert payload.checkedInAt == "18:30"
    assert db.commits == 0


def test_checkin_by_code_raises_for_unknown_guest_or_failed_insert():
    with pytest.raises(HTTPException) as not_found:
        CheckInService(
            FakeDb(result(first=event_row()), result(first=day_row()), result(first=None))
        ).create_check_in_by_code(CheckInByCodeRequest(code="g-404"))

    assert not_found.value.status_code == 404
    assert not_found.value.detail == "Guest code not found"

    with pytest.raises(HTTPException) as insert_failed:
        CheckInService(
            FakeDb(
                result(first=event_row()),
                result(first=day_row()),
                result(first=guest_row()),
                result(first=None),
            )
        ).create_check_in_by_code(CheckInByCodeRequest(code="g-000001"))

    assert insert_failed.value.status_code == 500
    assert insert_failed.value.detail == "Check-in could not be created"


def test_checkin_service_creates_manual_checkin_or_returns_existing_one():
    existing_db = FakeDb(
        result(first=day_row(id=40)),
        result(first=row(id=22, checked_in_at=datetime(2026, 4, 7, 18, 45))),
    )
    existing = CheckInService(existing_db).create_check_in(guest_id=1, event_day_id=40)
    assert existing == {"id": "22", "checkedInAt": "18:45"}
    assert existing_db.commits == 0

    create_db = FakeDb(
        result(first=day_row(id=40)),
        result(first=None),
        result(first=row(id=23, checked_in_at=datetime(2026, 4, 7, 19, 0))),
    )
    created = CheckInService(create_db).create_check_in(guest_id=1, event_day_id=40)
    assert created == {"id": "23", "checkedInAt": "19:00"}
    assert create_db.commits == 1


def test_prize_service_categories_and_payload():
    service = PrizeService(FakeDb())
    assert service.prize_category("Hauptpreis Reise", None) == "Hauptpreis"
    assert service.prize_category("Sport Set", None) == "Sport"
    assert service.prize_category("Ticket", None) == "Gutschein"
    assert service.prize_category("Kaffee Korb", None) == "Genuss"
    assert service.prize_category("Bluetooth Speaker", None) == "Sachpreis"

    db = FakeDb(
        result(first=event_row()),
        result(
            rows=[
                row(
                    id=1,
                    title="Hauptpreis Reise",
                    description=None,
                    value_chf=1000,
                    event_day_id=20,
                    draw_id=5,
                ),
                row(
                    id=2,
                    title="Sport Set",
                    description="Training",
                    value_chf=50.5,
                    event_day_id=20,
                    draw_id=None,
                ),
            ]
        ),
    )

    payload = PrizeService(db).get_prizes()

    assert payload["kpis"][0]["value"] == "2"
    assert payload["kpis"][1]["value"] == "CHF 1050.50"
    assert payload["kpis"][3]["progress"] == 50
    assert payload["nextHighlight"]["status"] == "Reserviert"


def test_analytics_service_builds_dashboard_metrics():
    db = FakeDb(
        result(scalar=10),
        result(scalar=6),
        result(scalar=2),
        result(scalar=3),
        result(scalar=1),
        result(rows=[row(month=" Apr ", participants=4)]),
        result(
            rows=[
                row(method="qr_code", total=3),
                row(method="manual_form", total=2),
                row(method="guest_code", total=1),
            ]
        ),
        result(rows=[row(label="Tag 1", value=3), row(label="Tag 2", value=3)]),
        result(rows=[row(name="Lottomatch 2026", start_date=date(2026, 4, 6), guests=4, checkins=6)]),
        result(scalar=7),
    )

    payload = AnalyticsService(db).get_analytics()

    assert payload["summary"] == {
        "totalGuests": 10,
        "checkInRate": 30,
        "activeEvents": 1,
        "completedDrawings": 3,
    }
    assert payload["participantTrend"] == [{"month": "Apr", "participants": 4}]
    assert payload["deviceDistribution"] == [
        {"key": "mobile", "label": "QR-Code", "value": 50},
        {"key": "desktop", "label": "Manuell", "value": 50},
        {"key": "tablet", "label": "Andere", "value": 0},
    ]
    assert payload["marketingConsent"]["grantedPercentage"] == 70
    assert payload["topEvents"][0]["conversion"] == 150.0


def test_analytics_service_handles_empty_database_totals():
    db = FakeDb(
        result(scalar=0),
        result(scalar=0),
        result(scalar=0),
        result(scalar=0),
        result(scalar=0),
        result(rows=[]),
        result(rows=[]),
        result(rows=[]),
        result(rows=[]),
        result(scalar=0),
    )

    payload = AnalyticsService(db).get_analytics()

    assert payload["summary"]["checkInRate"] == 0
    assert payload["deviceDistribution"][0]["value"] == 0
    assert payload["marketingConsent"]["breakdown"][2]["percentage"] == 0
