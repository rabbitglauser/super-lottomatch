"""AI support assistant with a human-in-the-loop audit trail.

Drafting is opt-in (``AI_DRAFTING_ENABLED`` + API key). Every draft and every
sent message is recorded in ``support_drafts`` with its source — ``ai`` (sent
unchanged), ``edited`` (human edited the AI draft), or ``human`` (written from
scratch) — so it is always auditable which replies were AI-generated.
"""

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from core import ai_config
from schemas.ai import (
    SupportDraftResponse,
    SupportMessageResponse,
)
from services.ai_client import AIClientError, generate_text

VALID_SOURCES = {"ai", "edited", "human"}


class SupportService:
    def __init__(self, db: Session):
        self.db = db

    def _event_context(self) -> str:
        row = self.db.execute(
            text(
                """
                select name, location, start_date, end_date
                from lotto_events
                order by event_year desc, start_date desc
                limit 1
                """
            )
        ).first()
        if row is None:
            return "Aktuell ist kein Event hinterlegt."
        return (
            f"Event: {row.name}. Ort: {row.location or 'offen'}. "
            f"Zeitraum: {row.start_date} bis {row.end_date}."
        )

    def _guest_id_for_code(self, guest_code: str | None) -> int | None:
        if not guest_code:
            return None
        row = self.db.execute(
            text(
                "select id from guests where upper(guest_code) = upper(:code) "
                "and deleted_at is null"
            ),
            {"code": guest_code},
        ).first()
        return row.id if row else None

    def _record(
        self,
        inquiry: str,
        draft: str | None,
        final_text: str | None,
        source: str,
        guest_id: int | None,
    ):
        return self.db.execute(
            text(
                """
                insert into support_drafts (
                  guest_id, inquiry, draft, final_text, source
                )
                values (:guest_id, :inquiry, :draft, :final_text, :source)
                returning id
                """
            ),
            {
                "guest_id": guest_id,
                "inquiry": inquiry,
                "draft": draft,
                "final_text": final_text,
                "source": source,
            },
        ).first()

    def draft(self, inquiry: str, guest_code: str | None) -> SupportDraftResponse:
        cleaned = inquiry.strip()
        if not cleaned:
            raise HTTPException(status_code=422, detail="inquiry is required")

        if not ai_config.drafting_enabled():
            return SupportDraftResponse(
                enabled=False,
                draft=None,
                source="disabled",
                message="KI-Entwürfe sind deaktiviert.",
            )

        context = self._event_context()
        guest_id = self._guest_id_for_code(guest_code)
        try:
            draft = generate_text(
                system=(
                    "You are a friendly German-speaking event support agent for "
                    "the STV Ennetbürgen Lottomatch raffle. Draft a concise, polite "
                    "reply using the event facts provided. Do not invent details."
                ),
                prompt=f"{context}\n\nGuest inquiry:\n{cleaned}",
                max_tokens=800,
            )
        except AIClientError as error:
            raise HTTPException(status_code=502, detail=str(error)) from error

        row = self._record(cleaned, draft, None, "ai", guest_id)
        self.db.commit()

        return SupportDraftResponse(
            enabled=True,
            draft=draft,
            source="ai",
            auditId=str(row.id) if row else None,
        )

    def record_message(
        self,
        inquiry: str,
        final_text: str,
        source: str,
        guest_code: str | None,
    ) -> SupportMessageResponse:
        if source not in VALID_SOURCES:
            raise HTTPException(
                status_code=422,
                detail=f"source must be one of: {', '.join(sorted(VALID_SOURCES))}",
            )

        guest_id = self._guest_id_for_code(guest_code)
        row = self._record(inquiry.strip(), None, final_text.strip(), source, guest_id)
        self.db.commit()

        if row is None:
            raise HTTPException(status_code=500, detail="Message could not be saved")

        return SupportMessageResponse(id=str(row.id), source=source)
