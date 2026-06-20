from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import LAN_ORIGIN_REGEX, get_cors_origins
from core.guest_codes import normalize_guest_code
from routers import (
    analytics,
    auth,
    checkins,
    dashboard,
    dedup,
    events,
    fairness,
    guests,
    prizes,
    support,
)

__all__ = ["app", "normalize_guest_code"]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_origin_regex=LAN_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Backend is running"}


app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(events.router)
app.include_router(guests.router)
app.include_router(checkins.router)
app.include_router(prizes.router)
app.include_router(analytics.router)
app.include_router(dedup.router)
app.include_router(fairness.router)
app.include_router(support.router)
