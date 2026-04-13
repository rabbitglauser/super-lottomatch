---
name: atomic-design
description: Explain and apply Atomic Design principles for the SuperLottomatch frontend. Use when deciding where a new component belongs, or when a user asks about the frontend component structure.
user_invocable: true
---

# Atomic Design — SuperLottomatch Frontend

The full reference is `docs/ATOMIC-DESIGN.md`. Read it when you need the folder layout, the Tailwind token table, or the current-state → target-state mapping for existing Login components. This skill is the operational summary.

## Folder layout

```
frontend/src/components/
├── atoms/          # Button, Input, Label, Icon, Badge, Spinner
├── molecules/      # FormField, SearchBar, Card
├── organisms/      # LoginForm, AdminHero, Footer, GuestList
├── templates/      # LoginTemplate, DashboardTemplate
└── shared/         # hooks, utils, types (outside the pyramid)
```

Pages live in `frontend/src/app/**/page.tsx` — they are the "pages" tier and stay where Next.js App Router expects them.

Each component gets its **own folder**: `atoms/Button/Button.tsx` (room for a test file and optional stories later).

## The one hard rule

**Dependencies flow down only.** atoms → molecules → organisms → templates → pages. Never the other way.

| Tier | Can import from | Owns state? |
|------|-----------------|-------------|
| atom | nothing (React + Tailwind only) | no — presentational |
| molecule | atoms | local UI state only |
| organism | atoms, molecules | yes — form/domain state |
| template | atoms, molecules, organisms | no — layout only, props for slots |
| page | everything above | yes — data fetching, routing, auth |

## The 5-question decision tree

When placing a new component, answer in order. Stop at the first "yes":

1. **Does it fetch data, read the route, or read auth?** → **page** (`app/**/page.tsx`)
2. **Is it a pure layout with slot props, no data?** → **template**
3. **Does it own form or domain state, or call handlers passed from a page?** → **organism**
4. **Is it a small cluster of atoms with only local UI state?** → **molecule**
5. **Is it a single primitive element (button, input, label, icon wrapper)?** → **atom**

## Styling — semantic Tailwind tokens only

Tokens from `frontend/src/app/globals.css`. **Never hard-code hex** in classNames:

- Page: `bg-page`, `text-text-primary`
- Brand: `text-brand`, `bg-brand`
- Text: `text-heading`, `text-muted`
- Inputs: `bg-input-bg`, `text-input-text`, `text-input-icon`
- Misc: `border-divider`, `text-footer`

If a new colour is needed, add the token to `globals.css` first, then reference it.

## Checklist before committing a component

- [ ] Correct tier folder (`atoms/` | `molecules/` | `organisms/` | `templates/`)
- [ ] Path: `components/<tier>s/<Name>/<Name>.tsx` (PascalCase)
- [ ] Imports only from lower tiers
- [ ] Strict TypeScript — no `any`, explicit prop types
- [ ] Semantic Tailwind tokens, no raw hex
- [ ] Accessible for 40+ non-technical users (large tap targets, high contrast, plain-language copy)
- [ ] Has a colocated `<Name>.test.tsx`

## How to use this skill

If `$ARGUMENTS` describes a component ("Where does a PasswordField go?"), run the 5-question decision tree and return the tier + the exact file path to create.

Otherwise, summarise the rules and point the user at `docs/ATOMIC-DESIGN.md` for the full reference. For scaffolding an actual file, use the `component-scaffold` skill.
