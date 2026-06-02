from types import SimpleNamespace

import pytest

from database import get_db
from main import app


class FakeExecuteResult:
    def __init__(self, row):
        self.row = row

    def first(self):
        return self.row


class FakeDb:
    def __init__(self, row):
        self.row = row
        self.params = None

    def execute(self, _statement, params=None):
        self.params = params
        return FakeExecuteResult(self.row)


@pytest.fixture(autouse=True)
def clear_dependency_overrides():
    yield
    app.dependency_overrides.clear()


def override_db(row):
    fake_db = FakeDb(row)

    def get_fake_db():
        yield fake_db

    app.dependency_overrides[get_db] = get_fake_db
    return fake_db


@pytest.mark.asyncio
async def test_root_returns_backend_running(client):
    response = await client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "Backend is running"}


@pytest.mark.asyncio
async def test_login_accepts_valid_credentials(client):
    fake_db = override_db(
        SimpleNamespace(
            id=1,
            first_name="Nina",
            last_name="Odermatt",
            email="nina.odermatt@stv-ennetbuergen.ch",
            password_hash="valid-password",
        )
    )

    response = await client.post(
        "/auth/login",
        json={
            "email": "  Nina.Odermatt@STV-Ennetbuergen.ch  ",
            "password": "valid-password",
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "name": "Nina Odermatt",
        "email": "nina.odermatt@stv-ennetbuergen.ch",
    }
    assert fake_db.params == {"email": "nina.odermatt@stv-ennetbuergen.ch"}


@pytest.mark.asyncio
async def test_login_rejects_invalid_password(client):
    override_db(
        SimpleNamespace(
            id=1,
            first_name="Nina",
            last_name="Odermatt",
            email="nina.odermatt@stv-ennetbuergen.ch",
            password_hash="valid-password",
        )
    )

    response = await client.post(
        "/auth/login",
        json={
            "email": "nina.odermatt@stv-ennetbuergen.ch",
            "password": "wrong-password",
        },
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Ungültige Zugangsdaten"}


@pytest.mark.asyncio
async def test_login_rejects_unknown_or_inactive_user(client):
    override_db(None)

    response = await client.post(
        "/auth/login",
        json={
            "email": "inactive@example.ch",
            "password": "valid-password",
        },
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Ungültige Zugangsdaten"}
