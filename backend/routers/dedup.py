from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas.ai import (
    AISettingsResponse,
    DuplicatesResponse,
    EnrichmentRequest,
    EnrichmentResponse,
)
from services.dedup_service import DedupService

router = APIRouter()


@router.get("/guests/duplicates", response_model=DuplicatesResponse)
def get_duplicates(threshold: int = 70, db: Session = Depends(get_db)):
    return DedupService(db).find_duplicates(threshold=threshold)


@router.get("/ai/settings", response_model=AISettingsResponse)
def get_ai_settings(db: Session = Depends(get_db)):
    return DedupService(db).settings()


@router.post("/guests/{guest_id}/enrich", response_model=EnrichmentResponse)
def enrich_guest(
    guest_id: int,
    payload: EnrichmentRequest,
    db: Session = Depends(get_db),
):
    return DedupService(db).enrich(guest_id, payload.consent)
