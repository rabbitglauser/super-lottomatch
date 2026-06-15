import csv
import io
from datetime import date, datetime
from types import SimpleNamespace

import pytest

from database import get_db
from main import app, normalize_guest_code


class FakeExecuteResult:
    def __init__(self, row):
        self.row = row

    def first(self):
        return self.row

    def all(self):
        if self.row is None:
            return []
        if isinstance(self.row, list):
            return self.row
        return [self.row]


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
@pytest.mark.parametrize(
    (
        "user_id",
        "first_name",
        "last_name",
        "email",
        "password",
        "password_hash",
    ),
    [
        (
            1,
            "Nina",
            "Odermatt",
            "nina.odermatt@stv-ennetbuergen.ch",
            "admin-1234",
            "$2a$12$QpZ4bXEyHh6nf1kg2paEEuQYNloOub..REq0G/14bM5VIFWzZ9Q82",
        ),
        (
            2,
            "Marco",
            "Bucher",
            "marco.bucher@stv-ennetbuergen.ch",
            "member-1234",
            "$2a$12$quyEM2wg0Dsho./NMpuj0.MJsrutqROUdskIPEh68gTLRUYO/pUL.",
        ),
        (
            3,
            "Sabrina",
            "Hess",
            "sabrina.hess@stv-ennetbuergen.ch",
            "member-1234",
            "$2a$12$B0ozvLeP2HsrsoBT6lVW9OuVNsZyZQm1/ZKpziV3zO0XJRUYCi.du",
        ),
    ],
)
async def test_login_accepts_seeded_bcrypt_hashes(
    client,
    user_id,
    first_name,
    last_name,
    email,
    password,
    password_hash,
):
    override_db(
        SimpleNamespace(
            id=user_id,
            first_name=first_name,
            last_name=last_name,
            email=email,
            password_hash=password_hash,
        )
    )

    response = await client.post(
        "/auth/login",
        json={
            "email": email,
            "password": password,
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "id": user_id,
        "name": f"{first_name} {last_name}",
        "email": email,
    }


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
            "email": "lukas.wyrsch@stv-ennetbuergen.ch",
            "password": "inactive-1234",
        },
    )

    assert response.status_code == 401
    assert response.json() == {"detail": "Ungültige Zugangsdaten"}


def test_normalize_guest_code_accepts_raw_codes_and_urls():
    assert normalize_guest_code(" g-000123 ") == "G-000123"
    assert (
        normalize_guest_code("https://example.ch/mobile/register/confirmation?code=g-000456")
        == "G-000456"
    )


@pytest.mark.asyncio
async def test_guest_export_returns_postal_csv(client):
    override_db(
        [
            SimpleNamespace(
                guest_code="G-000123",
                first_name="Nina",
                last_name="Odermatt",
                street="Dorfstrasse",
                house_number="67",
                postal_code="6373",
                city="Ennetbürgen",
                phone="0791234567",
                email="nina@example.ch",
                allow_email_marketing=True,
                allow_post_marketing=False,
                notes='Sitzt "vorne"; braucht Platz',
                last_participation=datetime(2026, 1, 17, 18, 30),
                created_at=date(2025, 12, 1),
            )
        ]
    )

    response = await client.get("/guests/export")

    assert response.status_code == 200
    assert response.headers["content-type"] == "text/csv; charset=utf-8"
    assert response.headers["content-disposition"] == (
        'attachment; filename="superlottomatch-guests-export.csv"'
    )
    assert response.content.startswith(b"\xef\xbb\xbf")

    csv_text = response.content.decode("utf-8-sig")
    rows = list(csv.reader(io.StringIO(csv_text), delimiter=";"))

    assert rows == [
        [
            "Gast-Code",
            "Vorname",
            "Nachname",
            "Strasse",
            "Hausnummer",
            "PLZ",
            "Ort",
            "Telefon",
            "E-Mail",
            "E-Mail Marketing",
            "Post Marketing",
            "Notizen",
            "Letzte Teilnahme",
            "Erstellt am",
        ],
        [
            "G-000123",
            "Nina",
            "Odermatt",
            "Dorfstrasse",
            "67",
            "6373",
            "Ennetbürgen",
            "0791234567",
            "nina@example.ch",
            "Ja",
            "Nein",
            'Sitzt "vorne"; braucht Platz',
            "17.01.2026",
            "01.12.2025",
        ],
    ]
