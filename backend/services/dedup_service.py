"""Guest deduplication and opt-in AI enrichment.

Duplicate detection is deterministic (``core.dedup``). Enrichment is an
opt-in AI feature: it is disabled unless an API key is configured and the
``AI_ENRICHMENT_ENABLED`` flag is set, and it only ever shares a guest's email
domain and city with the model — never the full name, address, or email.
"""

from fastapi import HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from core import ai_config
from core.dedup import find_duplicate_pairs
from schemas.ai import (
    AISettingsResponse,
    DuplicateGuest,
    DuplicatePair,
    DuplicatesResponse,
    EnrichmentResponse,
    EnrichmentSuggestion,
)
from services.ai_client import AIClientError, generate_json

# The only guest attributes ever sent to the AI model during enrichment.
SHARED_FIELDS = ["E-Mail-Domain", "Ort"]

ENRICHMENT_SCHEMA = {
    "type": "object",
    "properties": {
        "organization": {"type": ["string", "null"]},
        "country": {"type": ["string", "null"]},
        "confidence": {"type": "integer"},
    },
    "required": ["organization", "country", "confidence"],
    "additionalProperties": False,
}


class DedupService:
    def __init__(self, db: Session):
        self.db = db

    def _guest_rows(self):
        return self.db.execute(
            text(
                """
                select
                  g.id,
                  g.first_name,
                  g.last_name,
                  g.email,
                  g.phone,
                  a.city
                from guests g
                join addresses a on a.id = g.address_id
                where g.deleted_at is null
                order by g.last_name, g.first_name
                """
            )
        ).all()

    def find_duplicates(self, threshold: int = 70) -> DuplicatesResponse:
        guests = [
            {
                "id": row.id,
                "first_name": row.first_name,
                "last_name": row.last_name,
                "email": row.email,
                "city": row.city,
                "phone": row.phone,
            }
            for row in self._guest_rows()
        ]

        pairs = []
        for pair in find_duplicate_pairs(guests, threshold=threshold):
            pairs.append(
                DuplicatePair(
                    left=self._duplicate_guest(pair["left"]),
                    right=self._duplicate_guest(pair["right"]),
                    confidence=int(pair["confidence"]),
                    reasons=list(pair["reasons"]),
                )
            )
        return DuplicatesResponse(pairs=pairs)

    @staticmethod
    def _duplicate_guest(record: dict[str, object]) -> DuplicateGuest:
        return DuplicateGuest(
            id=str(record["id"]),
            name=f"{record['first_name']} {record['last_name']}",
            email=record["email"],
            city=record["city"],
        )

    def settings(self) -> AISettingsResponse:
        return AISettingsResponse(
            enrichmentEnabled=ai_config.enrichment_enabled(),
            draftingEnabled=ai_config.drafting_enabled(),
            model=ai_config.get_model(),
            sharedFields=SHARED_FIELDS,
        )

    def enrich(self, guest_id: int, consent: bool) -> EnrichmentResponse:
        if not ai_config.enrichment_enabled():
            return EnrichmentResponse(
                guestId=str(guest_id),
                enabled=False,
                sharedWithModel=SHARED_FIELDS,
                suggestion=None,
                message="KI-Anreicherung ist deaktiviert.",
            )

        if not consent:
            raise HTTPException(
                status_code=403,
                detail="Enrichment requires explicit consent",
            )

        row = self.db.execute(
            text(
                """
                select g.email, a.city
                from guests g
                join addresses a on a.id = g.address_id
                where g.id = :guest_id and g.deleted_at is null
                """
            ),
            {"guest_id": guest_id},
        ).first()
        if row is None:
            raise HTTPException(status_code=404, detail="Guest not found")

        domain = (row.email or "").split("@")[-1] if row.email else ""
        try:
            result = generate_json(
                system=(
                    "You enrich event guest profiles. Only the email domain and "
                    "city are provided. Infer a likely organization and country. "
                    "Use null when unsure. Never invent personal data."
                ),
                prompt=(
                    f"Email domain: {domain or 'unknown'}\n"
                    f"City: {row.city or 'unknown'}\n"
                    "Return organization, country and a 0-100 confidence."
                ),
                schema=ENRICHMENT_SCHEMA,
            )
        except AIClientError as error:
            raise HTTPException(status_code=502, detail=str(error)) from error

        return EnrichmentResponse(
            guestId=str(guest_id),
            enabled=True,
            sharedWithModel=SHARED_FIELDS,
            suggestion=EnrichmentSuggestion(
                organization=result.get("organization"),
                country=result.get("country"),
                confidence=int(result.get("confidence") or 0),
            ),
        )
