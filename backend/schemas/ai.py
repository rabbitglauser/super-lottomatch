"""Pydantic schemas for AI-assisted and analytics features.

Kept in a dedicated module so the AI stories stay self-contained and don't
collide with the core request/response models in ``schemas/__init__.py``.
"""

from pydantic import BaseModel


class DuplicateGuest(BaseModel):
    id: str
    name: str
    email: str | None
    city: str | None


class DuplicatePair(BaseModel):
    left: DuplicateGuest
    right: DuplicateGuest
    confidence: int
    reasons: list[str]


class DuplicatesResponse(BaseModel):
    pairs: list[DuplicatePair]


class EnrichmentRequest(BaseModel):
    # Explicit per-request consent; enrichment is opt-in only.
    consent: bool = False


class EnrichmentSuggestion(BaseModel):
    organization: str | None
    country: str | None
    confidence: int


class EnrichmentResponse(BaseModel):
    guestId: str
    enabled: bool
    sharedWithModel: list[str]
    suggestion: EnrichmentSuggestion | None
    message: str | None = None


class AISettingsResponse(BaseModel):
    enrichmentEnabled: bool
    draftingEnabled: bool
    model: str
    sharedFields: list[str]


class FairnessGroup(BaseModel):
    group: str
    expectedShare: float
    observedShare: float
    deviation: float
    flagged: bool


class FairnessResponse(BaseModel):
    fairnessScore: int
    runs: int
    winnerCount: int
    participantCount: int
    groups: list[FairnessGroup]
    edgeCases: list[str]
    recommendations: list[str]


class SupportDraftRequest(BaseModel):
    inquiry: str
    guestCode: str | None = None


class SupportDraftResponse(BaseModel):
    enabled: bool
    draft: str | None
    source: str
    auditId: str | None = None
    message: str | None = None


class SupportMessageRequest(BaseModel):
    inquiry: str
    finalText: str
    # "ai" = sent unchanged, "edited" = human edited the AI draft,
    # "human" = written from scratch.
    source: str = "edited"
    guestCode: str | None = None


class SupportMessageResponse(BaseModel):
    id: str
    source: str
