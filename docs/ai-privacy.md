# AI Privacy & Data Processing

SuperLottomatch includes optional AI-assisted features. This document records
what data is processed, on what legal basis, and how to control it. It supports
the **ai-automation / privacy** epic.

## Principles

- **Off by default.** No data is ever sent to an AI provider unless an API key
  is configured **and** the relevant feature flag is explicitly enabled.
- **Opt-in per action.** Guest enrichment additionally requires explicit
  per-request consent (`consent: true`); without it the backend returns `403`.
- **Data minimisation.** Only the minimum fields needed for a feature are sent.

## Configuration flags

All AI behaviour is governed by environment variables (see
`backend/core/ai_config.py`):

| Variable | Default | Effect |
|----------|---------|--------|
| `ANTHROPIC_API_KEY` | _unset_ | Without it, **no** AI feature runs. |
| `AI_MODEL` | `claude-opus-4-8` | Model used for all AI calls. |
| `AI_ENRICHMENT_ENABLED` | off | Enables guest profile enrichment. |
| `AI_DRAFTING_ENABLED` | off | Enables support reply drafting. |

`GET /ai/settings` reports the current state so the UI can show accurate
toggles per environment.

## What is shared with the AI provider

| Feature | Data sent | Data **not** sent |
|---------|-----------|-------------------|
| Duplicate detection | _Nothing_ — fully local, deterministic (`core/dedup.py`). | — |
| Guest enrichment | Email **domain** only (e.g. `example.ch`) and city. | Name, full email, address, phone, notes. |
| Fairness recommendations | Aggregate fairness score and group deviation labels. | Any individual guest data. |
| Support drafting | The support agent's typed inquiry and public event facts (name, dates, location). | Guest PII beyond what the agent typed. |

## Audit trail

Support replies are logged in the `support_drafts` table with a `source`
column (`ai`, `edited`, `human`), so it is always possible to determine which
messages were AI-generated versus written or edited by a human.

## Data subject considerations (CH/EU)

- Enrichment is opt-in and shares only non-identifying signals (email domain,
  city). Operators should still inform guests that optional enrichment may run.
- The AI provider (Anthropic) processes inputs per its commercial terms; inputs
  are not used for training. No special-category data is sent.
- To disable all processing, unset `ANTHROPIC_API_KEY` or leave the feature
  flags off — the application remains fully functional.
