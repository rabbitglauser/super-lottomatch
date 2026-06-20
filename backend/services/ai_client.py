"""Thin wrapper around the Anthropic SDK for AI-assisted features.

The wrapper isolates SDK usage in one place so the rest of the backend depends
only on small, typed helpers. It uses the latest Claude model with adaptive
thinking. Callers must gate invocations behind the flags in ``core.ai_config``.
"""

import json

from core.ai_config import get_model


class AIClientError(RuntimeError):
    """Raised when an AI call cannot be completed."""


def _client():
    try:
        import anthropic
    except ImportError as error:  # pragma: no cover - import guard
        raise AIClientError("anthropic SDK is not installed") from error
    return anthropic.Anthropic()


def _first_text(response) -> str:
    for block in response.content:
        if block.type == "text":
            return block.text
    return ""


def generate_text(system: str, prompt: str, max_tokens: int = 1024) -> str:
    """Return a plain-text completion from Claude."""
    try:
        response = _client().messages.create(
            model=get_model(),
            max_tokens=max_tokens,
            thinking={"type": "adaptive"},
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
    except Exception as error:  # pragma: no cover - network/SDK errors
        raise AIClientError(str(error)) from error

    if getattr(response, "stop_reason", None) == "refusal":
        raise AIClientError("The AI model declined to answer this request")

    return _first_text(response).strip()


def generate_json(
    system: str,
    prompt: str,
    schema: dict[str, object],
    max_tokens: int = 1024,
) -> dict[str, object]:
    """Return a schema-constrained JSON object from Claude."""
    try:
        response = _client().messages.create(
            model=get_model(),
            max_tokens=max_tokens,
            thinking={"type": "adaptive"},
            system=system,
            messages=[{"role": "user", "content": prompt}],
            output_config={"format": {"type": "json_schema", "schema": schema}},
        )
    except Exception as error:  # pragma: no cover - network/SDK errors
        raise AIClientError(str(error)) from error

    if getattr(response, "stop_reason", None) == "refusal":
        raise AIClientError("The AI model declined to answer this request")

    text = _first_text(response)
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as error:
        raise AIClientError("AI response was not valid JSON") from error

    if not isinstance(parsed, dict):
        raise AIClientError("AI response was not a JSON object")
    return parsed
