from decimal import Decimal
from types import SimpleNamespace

import pytest

from core.raffle_rules import (
    ELIGIBILITY_LABELS,
    normalize_eligibility,
    normalize_value_chf,
    validate_prize_config,
    validate_winner_count,
)
from database import get_db
from main import app


class FakeResult:
    def __init__(self, row):
        self.row = row

    def first(self):
        return self.row

    def all(self):
        if self.row is None:
            return []
        return self.row if isinstance(self.row, list) else [self.row]


class FakeDb:
    def __init__(self, row):
        self.row = row

    def execute(self, _statement, params=None):
        return FakeResult(self.row)

    def commit(self):
        pass

    def rollback(self):
        pass


@pytest.fixture(autouse=True)
def clear_overrides():
    yield
    app.dependency_overrides.clear()


def override_db(row):
    def get_fake_db():
        yield FakeDb(row)

    app.dependency_overrides[get_db] = get_fake_db


# --- pure validation unit tests ---------------------------------------------


def test_validate_winner_count_accepts_value_within_capacity():
    assert validate_winner_count(3, 100) == 3


def test_validate_winner_count_allows_count_equal_to_capacity():
    assert validate_winner_count(50, 50) == 50


def test_validate_winner_count_rejects_zero():
    with pytest.raises(ValueError, match="at least 1"):
        validate_winner_count(0, 100)


def test_validate_winner_count_rejects_more_winners_than_capacity():
    with pytest.raises(ValueError, match="cannot exceed"):
        validate_winner_count(101, 100)


def test_validate_winner_count_rejects_boolean():
    with pytest.raises(ValueError, match="integer"):
        validate_winner_count(True, 100)


def test_normalize_eligibility_accepts_known_values():
    assert normalize_eligibility(" Checked_In ") == "checked_in"
    assert normalize_eligibility("all") == "all"


def test_normalize_eligibility_rejects_unknown_value():
    with pytest.raises(ValueError, match="eligibility must be one of"):
        normalize_eligibility("vip")


def test_normalize_value_chf_rejects_negative():
    with pytest.raises(ValueError, match="must not be negative"):
        normalize_value_chf(-1)


def test_normalize_value_chf_coerces_strings():
    assert normalize_value_chf("150.50") == Decimal("150.50")


def test_validate_prize_config_returns_cleaned_values():
    cleaned = validate_prize_config(
        title="  E-Bike  ",
        winner_count=2,
        eligibility="checked_in",
        value_chf="2500",
        capacity=300,
    )
    assert cleaned == {
        "title": "E-Bike",
        "winner_count": 2,
        "eligibility": "checked_in",
        "value_chf": Decimal("2500"),
    }


def test_validate_prize_config_requires_title():
    with pytest.raises(ValueError, match="title is required"):
        validate_prize_config(
            title="   ",
            winner_count=1,
            eligibility="all",
            value_chf=0,
            capacity=10,
        )


def test_eligibility_labels_cover_all_options():
    assert set(ELIGIBILITY_LABELS) == {"all", "checked_in"}


# --- endpoint tests ----------------------------------------------------------


def _prize_row(**overrides):
    base = {
        "id": 7,
        "name": "Lottomatch 2026",
        "capacity": 300,
        "event_day_id": 2,
        "title": "E-Bike",
        "description": "Hauptpreis",
        "value_chf": Decimal("2500.00"),
        "winner_count": 1,
        "eligibility": "checked_in",
    }
    base.update(overrides)
    return SimpleNamespace(**base)


@pytest.mark.asyncio
async def test_create_prize_persists_valid_config(client):
    override_db(_prize_row(winner_count=2))

    response = await client.post(
        "/prizes",
        json={
            "eventDayId": 2,
            "title": "E-Bike",
            "description": "Hauptpreis",
            "valueChf": 2500,
            "winnerCount": 2,
            "eligibility": "checked_in",
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["winnerCount"] == 2
    assert body["eligibility"] == "checked_in"
    assert body["eventDayId"] == 2


@pytest.mark.asyncio
async def test_create_prize_rejects_more_winners_than_capacity(client):
    override_db(_prize_row(capacity=5))

    response = await client.post(
        "/prizes",
        json={
            "eventDayId": 2,
            "title": "E-Bike",
            "winnerCount": 10,
            "eligibility": "all",
        },
    )

    assert response.status_code == 422
    assert "cannot exceed" in response.json()["detail"]


@pytest.mark.asyncio
async def test_public_raffle_lists_prizes_and_total_winners(client):
    override_db(_prize_row(winner_count=3))

    response = await client.get("/prizes/public")

    assert response.status_code == 200
    body = response.json()
    assert body["eventName"] == "Lottomatch 2026"
    assert body["totalWinners"] == 3
    assert body["prizes"][0]["winnerCount"] == 3
    assert body["prizes"][0]["eligibilityLabel"] == "Nur eingecheckte Gäste"
