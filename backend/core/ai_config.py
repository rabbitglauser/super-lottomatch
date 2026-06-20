"""Configuration and privacy gating for AI-assisted features.

All AI features are opt-in and disabled by default. They activate only when an
Anthropic API key is configured *and* the relevant feature flag is enabled,
so the application runs fully without any AI provider.

Environment variables:
- ANTHROPIC_API_KEY       provider credential (no AI calls without it)
- AI_MODEL                model id (default: claude-opus-4-8)
- AI_ENRICHMENT_ENABLED   guest profile enrichment (default: off)
- AI_DRAFTING_ENABLED     support reply drafting (default: off)
"""

import os

DEFAULT_AI_MODEL = "claude-opus-4-8"


def _flag(name: str) -> bool:
    return os.environ.get(name, "").strip().lower() in {"1", "true", "yes", "on"}


def has_api_key() -> bool:
    return bool(os.environ.get("ANTHROPIC_API_KEY", "").strip())


def get_model() -> str:
    return os.environ.get("AI_MODEL", "").strip() or DEFAULT_AI_MODEL


def enrichment_enabled() -> bool:
    """Guest data enrichment requires an API key and an explicit opt-in."""
    return has_api_key() and _flag("AI_ENRICHMENT_ENABLED")


def drafting_enabled() -> bool:
    """Support reply drafting requires an API key and an explicit opt-in."""
    return has_api_key() and _flag("AI_DRAFTING_ENABLED")
