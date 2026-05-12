from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.routers.guest_router import router, get_guest_service


class FakeGuestService:
    def create_guest(self, payload):
        return {
            "id": 1,
            **payload.model_dump()
        }

    def get_guest(self, guest_id: int):
        return {
            "id": guest_id,
            "guest_code": "G001",
            "first_name": "Max",
            "last_name": "Muster",
            "address_id": 1,
            "phone": "0791234567",
            "email": "max@example.com",
            "allow_email_marketing": True,
            "allow_post_marketing": False,
            "notes": "Testgast",
        }


def override_guest_service():
    return FakeGuestService()


app = FastAPI()
app.include_router(router)
app.dependency_overrides[get_guest_service] = override_guest_service

client = TestClient(app)


def test_create_guest():
    payload = {
        "guest_code": "G001",
        "first_name": "Max",
        "last_name": "Muster",
        "address_id": 1,
        "phone": "0791234567",
        "email": "max@example.com",
        "allow_email_marketing": True,
        "allow_post_marketing": False,
        "notes": "Testgast",
    }

    response = client.post("/guests/", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["first_name"] == "Max"
    assert data["email"] == "max@example.com"


def test_get_guest():
    response = client.get("/guests/1")

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["guest_code"] == "G001"