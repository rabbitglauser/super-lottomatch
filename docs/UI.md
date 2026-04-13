# UI Design — SuperLottomatch

**Status:** In Development

This is the umbrella doc for UI-related conventions. For the full component organisation rules, see **[`ATOMIC-DESIGN.md`](ATOMIC-DESIGN.md)**.

## Audience

Primary users are **aged 40+, German-speaking, and non-technical**. The UI must favour:

- Large tap targets and readable type (`h-20` inputs, `text-2xl` body, `rounded-3xl` corners — current baseline).
- High contrast and semantic colours, not decorative ones.
- Minimal steps for the common flows (registration, check-in, draw).
- Clear error messages in plain language.

## Component organisation

Components follow **Atomic Design** (atoms → molecules → organisms → templates → pages). Full rules, folder layout, and the current-state → target-state mapping for `components/Login/` are in [`ATOMIC-DESIGN.md`](ATOMIC-DESIGN.md).

Two Claude skills enforce the convention:

- `/atomic-design` — decision tree for "where does this component go?"
- `/component-scaffold <tier> <Name>` — generates a new component at the correct path.

## Styling

The Tailwind v4 theme lives in `frontend/src/app/globals.css`. Components must use the semantic tokens (`text-brand`, `bg-input-bg`, `text-heading`, etc.) — **never hard-code hex values** in className strings. New colours require a new token in `globals.css` first.

## Mockups

Early mockups and screenshots live under `docs/ui/` and `docs/screenshots/`.
