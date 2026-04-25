# UI Design — SuperLottomatch

**Status:** In Development

This is the umbrella doc for UI-related conventions. For the full component organisation rules, see **[`ATOMIC-DESIGN.md`](ATOMIC-DESIGN.md)**.

## Audience

Primary users are still expected to be **aged 40+, German-speaking, and often non-technical**. The UI should favour:

- Large tap targets and readable type where the flow is form-heavy.
- High contrast and semantic colours, not decorative ones.
- Minimal steps for the common flows (registration, check-in, draw).
- Clear error messages in plain language.

## Component organisation

Components follow **Atomic Design** (atoms → molecules → organisms → templates → pages). Full rules and the current folder layout are in [`ATOMIC-DESIGN.md`](ATOMIC-DESIGN.md).

Two Claude skills enforce the convention:

- `/atomic-design` — decision tree for "where does this component go?"
- `/component-scaffold <tier> <Name>` — generates a new component at the correct path.

## Styling

The Tailwind v4 theme lives in `frontend/src/app/globals.css`. Prefer the semantic tokens (`text-brand`, `bg-input-bg`, `text-heading`, etc.) for new work. Some existing high-fidelity pages still contain direct palette values, so treat token usage as the default direction rather than an already-complete cleanup.

## Mockups

Early mockups and design references currently live under `docs/ui/`.
