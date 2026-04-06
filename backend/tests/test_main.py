import pytest


@pytest.mark.asyncio
async def test_root_returns_backend_running(client):
    response = await client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "Backend is running"}
