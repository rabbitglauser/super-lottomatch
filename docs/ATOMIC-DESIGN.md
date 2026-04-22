# Atomic Design — SuperLottomatch Frontend

**Status:** Adopted
**Applies to:** `frontend/src/`

This document is the source of truth for how React components are organised in the SuperLottomatch frontend. It adapts Brad Frost's [Atomic Design](https://atomicdesign.bradfrost.com/) to Next.js App Router and the project's existing Tailwind v4 theme.

---

## 1. Why atomic design

The frontend has a small but growing component tree. Without a convention, reusables will keep accumulating inside feature folders (as they did under `components/Login/`), duplication will creep in, and new team members will have to reverse-engineer where things belong.

Atomic design gives us:

- A **single place** to look for every kind of reusable (buttons live with buttons).
- A **dependency rule** that makes "what can import what" mechanical instead of judgement-based.
- A **shared vocabulary** (atom / molecule / organism / template / page) so PR reviews and planning don't waste time on naming.

---

## 2. Folder layout

```
frontend/src/
├── app/                        # Next.js App Router — routes, data, metadata
│   ├── layout.tsx              # = page shell
│   ├── page.tsx                # = page (login)
│   └── dashboard/
│       ├── layout.tsx          # = dashboard shell (TopNavbar + Sidebar)
│       ├── page.tsx            # = page
│       ├── events/page.tsx     # = page
│       ├── guests/page.tsx     # = page
│       ├── check-in/page.tsx   # = page
│       ├── prizes/page.tsx     # = page
│       ├── data/page.tsx       # = page
│       └── settings/page.tsx   # = page
├── components/
│   ├── atoms/                  # IconButton, Input, Label, NavItem
│   ├── molecules/              # FormField, NavActions, SidebarHeader, SidebarNav
│   ├── organisms/              # LoginForm, AdminHero, Footer, Sidebar, TopNavbar
│   ├── templates/              # LoginTemplate, DashboardTemplate
│   └── ui/                     # shadcn/ui primitives (Button, etc.)
└── lib/                        # utils (cn), constants (API_BASE_URL, NAV_ITEMS)
```

**One folder per component.** `atoms/Button/Button.tsx` — not `atoms/Button.tsx`. This leaves room for a colocated test file, optional `Button.stories.tsx`, and a local `types.ts` without restructuring later.

**Pages stay in `app/`.** They are the "pages" tier of atomic design. This respects the Next.js App Router and avoids fighting the framework's conventions. See `frontend/AGENTS.md` — this project uses Next.js 16 with breaking changes, so route files must stay where the framework expects them.

---

## 3. The five tiers

| Tier | Can import from | Owns state? | Examples |
|------|-----------------|-------------|----------|
| **atoms** | shadcn `ui/` primitives only | no — pure presentational | `IconButton`, `Input`, `Label`, `NavItem` |
| **molecules** | atoms | local UI state only (focus, hover, toggle) | `FormField`, `NavActions`, `SidebarHeader`, `SidebarNav` |
| **organisms** | atoms, molecules | yes — owns form state, accepts handlers | `LoginForm`, `AdminHero`, `Footer`, `Sidebar`, `TopNavbar` |
| **templates** | atoms, molecules, organisms | no — pure layout, content via slots/props | `LoginTemplate`, `DashboardTemplate` |
| **pages** (`app/**/page.tsx`) | everything above | yes — data fetching, routing, auth | `app/page.tsx`, `app/dashboard/page.tsx` |

### The one hard rule

**Dependencies flow down the list only.** An atom may never import a molecule. A molecule may never import an organism. A template may never import a page.

If you find yourself wanting to break this rule, the component probably belongs one tier higher than you thought.

### What each tier may NOT do

- **Atoms** — no API calls, no global state, no routing, no `"use client"` unless strictly needed for an event handler.
- **Molecules** — no business logic (no "is this a valid guest code?"), no data fetching.
- **Organisms** — no routing (`useRouter`) unless they own a real side-effect; prefer lifting routing to the page.
- **Templates** — no data. They take children or slot props and arrange them. If you're tempted to fetch something, you're writing a page.

---

## 4. Styling rules

Use the **semantic Tailwind tokens** defined in `frontend/src/app/globals.css`:

| Token | CSS variable | Use for |
|-------|--------------|---------|
| `bg-page` | `--color-page` | Page background |
| `text-text-primary` | `--color-text-primary` | Default body text |
| `text-brand` / `bg-brand` | `--color-brand` | Primary brand accents (STV red) |
| `text-heading` | `--color-heading` | Section headings |
| `text-muted-foreground` | `--muted-foreground` | Secondary labels, captions |
| `bg-input-bg` / `text-input-text` | `--color-input-bg` / `--color-input-text` | Form fields |
| `text-input-icon` | `--color-input-icon` | Icons inside inputs |
| `border-divider` | `--color-divider` | Section separators |
| `text-footer` | `--color-footer` | Footer text |

**Never hard-code hex values** in component classNames. If a new colour is needed, add a token to `globals.css` first, then use it.

Target audience note: users are **40+, German-speaking, non-technical**. Keep tap targets large (`h-20` inputs is the current baseline), contrast high, and copy simple. Accessibility is a first-class requirement, not a polish step.

---

## 5. Component authoring checklist

Before committing a new component, confirm:

- [ ] Lives in the correct tier folder (`atoms/` | `molecules/` | `organisms/` | `templates/`).
- [ ] File path is `components/<tier>s/<Name>/<Name>.tsx` (PascalCase).
- [ ] Imports only from lower tiers (see the dependency rule).
- [ ] No `any` — all props have explicit TypeScript types (strict mode is on).
- [ ] Uses semantic Tailwind tokens, no raw hex.
- [ ] Has a `<Name>.test.tsx` next to it (see `docs/TESTING.md`).
- [ ] No dead code, no magic numbers, meaningful names (see `.claude/skills/code-review.md`).

### The "5 questions" tier decision tree

When you're not sure which tier a new component belongs to, answer in order and stop at the first "yes":

1. **Does it fetch data, read the route, or read auth?** → it's a **page**.
2. **Is it a pure layout with slot props, no data?** → it's a **template**.
3. **Does it own form or domain state, or call handlers passed from a page?** → it's an **organism**.
4. **Is it a small cluster of atoms with only local UI state?** → it's a **molecule**.
5. **Is it a single primitive element (button, input, label, icon wrapper)?** → it's an **atom**.

---

## 6. Current component map

The atomic design refactor is **complete**. All components follow the tier structure:

| Component | Path | Tier | Notes |
|-----------|------|------|-------|
| `IconButton` | `atoms/IconButton/` | atom | Wraps shadcn `Button` (ghost + icon variant) |
| `Input` | `atoms/Input/` | atom | Custom styled text input |
| `Label` | `atoms/Label/` | atom | Form label with uppercase styling |
| `NavItem` | `atoms/NavItem/` | atom | Sidebar link with active state detection |
| `FormField` | `molecules/FormField/` | molecule | Composes Label + Input + icon |
| `NavActions` | `molecules/NavActions/` | molecule | Top navbar right-side actions |
| `SidebarHeader` | `molecules/SidebarHeader/` | molecule | Org icon + name display |
| `SidebarNav` | `molecules/SidebarNav/` | molecule | Renders NAV_ITEMS via NavItem atoms |
| `AdminHero` | `organisms/AdminHero/` | organism | Login page branded hero section |
| `Footer` | `organisms/Footer/` | organism | Copyright + legal links |
| `LoginForm` | `organisms/LoginForm/` | organism | Login form with API integration |
| `Sidebar` | `organisms/Sidebar/` | organism | Full sidebar: header + nav + CTA |
| `TopNavbar` | `organisms/TopNavbar/` | organism | Top bar with branding + actions |
| `DashboardTemplate` | `templates/DashboardTemplate/` | template | TopNavbar + Sidebar + content slot |
| `LoginTemplate` | `templates/LoginTemplate/` | template | Hero + form two-column layout |

**Primitive layer:** shadcn/ui components live in `components/ui/` (currently: `button.tsx`). Atoms wrap these primitives with domain-specific styling.

**Barrel exports:** Every component folder has an `index.ts` for clean imports (e.g. `@/components/atoms/NavItem`).

---

## 7. Claude skills for this convention

Two invocable skills live under `.claude/skills/`:

- **`atomic-design`** — loads this doc's rules and answers "where should this component go?" using the 5-question decision tree.
- **`component-scaffold`** — creates a new component file at the correct path with the project's TypeScript + Tailwind conventions pre-filled. Invoke as `/component-scaffold <tier> <Name>`, e.g. `/component-scaffold atom Button`.

When you add a component by hand, skim this doc. When Claude adds one, it consults these skills. Either way, the rules are the same.

---

## 8. Related docs

- `docs/UI.md` — UI design overview (umbrella for UI-related docs)
- `docs/ARCHITECTURE.md` — system architecture and ADRs
- `docs/TESTING.md` — frontend and backend testing conventions
- `CLAUDE.md` — project-wide code quality rules
- `frontend/AGENTS.md` — Next.js 16 gotchas
