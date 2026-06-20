from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas.ai import (
    SupportDraftRequest,
    SupportDraftResponse,
    SupportMessageRequest,
    SupportMessageResponse,
)
from services.support_service import SupportService

router = APIRouter()


@router.post("/support/draft", response_model=SupportDraftResponse)
def draft_reply(payload: SupportDraftRequest, db: Session = Depends(get_db)):
    return SupportService(db).draft(payload.inquiry, payload.guestCode)


@router.post("/support/messages", response_model=SupportMessageResponse)
def record_message(payload: SupportMessageRequest, db: Session = Depends(get_db)):
    return SupportService(db).record_message(
        payload.inquiry, payload.finalText, payload.source, payload.guestCode
    )
