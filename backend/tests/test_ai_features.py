from types import SimpleNamespace

import pytest

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


# --- AI settings & gating (default: disabled) --------------------------------


@pytest.mark.asyncio
async def test_ai_settings_default_disabled(client):
    override_db(None)
    response = await client.get("/ai/settings")
    assert response.status_code == 200
    body = response.json()
    assert body["enrichmentEnabled"] is False
    assert body["draftingEnabled"] is False
    assert body["model"] == "claude-opus-4-8"
    assert "Ort" in body["sharedFields"]


@pytest.mark.asyncio
async def test_enrich_returns_disabled_without_ai(client):
    override_db(SimpleNamespace(email="a@b.ch", city="Ennetbürgen"))
    response = await client.post("/guests/5/enrich", json={"consent": True})
    assert response.status_code == 200
    body = response.json()
    assert body["enabled"] is False
    assert body["suggestion"] is None


# --- Duplicate detection -----------------------------------------------------


@pytest.mark.asyncio
async def test_duplicates_endpoint_finds_pair(client):
    rows = [
        SimpleNamespace(
            id=1,
            first_name="Nina",
            last_name="Odermatt",
            email="nina@example.ch",
            phone="079",
            city="Ennetbürgen",
        ),
        SimpleNamespace(
            id=2,
            first_name="Nina",
            last_name="Odermatt",
            email="nina@example.ch",
            phone="079",
            city="Ennetbürgen",
        ),
    ]
    override_db(rows)
    response = await client.get("/guests/duplicates")
    assert response.status_code == 200
    pairs = response.json()["pairs"]
    assert len(pairs) == 1
    assert pairs[0]["confidence"] >= 80


# --- Fairness ----------------------------------------------------------------


@pytest.mark.asyncio
async def test_fairness_single_group_is_fair(client):
    override_db(SimpleNamespace(id=1, city="Ennetbürgen"))
    response = await client.get("/raffle/fairness?winnerCount=1&runs=1000&seed=5")
    assert response.status_code == 200
    body = response.json()
    assert body["fairnessScore"] == 100
    assert body["recommendations"]


@pytest.mark.asyncio
async def test_fairness_rejects_zero_winner_count(client):
    override_db(SimpleNamespace(id=1, city="Ennetbürgen"))
    response = await client.get("/raffle/fairness?winnerCount=0")
    assert response.status_code == 422


# --- Support assistant audit trail -------------------------------------------


@pytest.mark.asyncio
async def test_support_draft_disabled_without_ai(client):
    override_db(SimpleNamespace(id=1))
    response = await client.post(
        "/support/draft", json={"inquiry": "Wann ist die Verlosung?"}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["enabled"] is False
    assert body["source"] == "disabled"


@pytest.mark.asyncio
async def test_support_record_message_logs_source(client):
    override_db(SimpleNamespace(id=42))
    response = await client.post(
        "/support/messages",
        json={
            "inquiry": "Wann ist die Verlosung?",
            "finalText": "Am Samstag um 17:00 Uhr.",
            "source": "edited",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["id"] == "42"
    assert body["source"] == "edited"


@pytest.mark.asyncio
async def test_support_record_message_rejects_bad_source(client):
    override_db(SimpleNamespace(id=1))
    response = await client.post(
        "/support/messages",
        json={"inquiry": "x", "finalText": "y", "source": "bogus"},
    )
    assert response.status_code == 422
