# Architecture Decision Records

**Date:** 2026-04-25 (last updated)
**Status:** In Development

This document records the major architectural decisions and target-state decisions made during the development of SuperLottomatch.

Important: some ADRs describe the intended direction of the school project rather than features that are fully implemented in the current repository. When the live repo diverges, the "Current repo note" beneath the ADR is the source of truth.

---

## ADR-001: Next.js with React, TypeScript, and Tailwind CSS for Frontend

**Status:** Accepted

**Context:**
The application needs two frontends: a public guest registration app and a protected admin dashboard. Both must work cross-platform, be mobile-friendly, and serve an audience where the majority is aged 40+. The team has 5 weeks and 2 developers, so developer velocity is critical. The guest app must load fast on older smartphones.

**Decision:**
Use Next.js 16 (App Router) with React 19, TypeScript 5, and Tailwind CSS v4. The guest app and admin dashboard are separate route groups within the same Next.js project.

**Alternatives Considered:**
- **Plain React (Vite):** No SSR, slower initial load on older devices, requires manual routing setup.
- **Vue.js / Nuxt:** Viable alternative, but the team has more React experience.
- **Server-rendered HTML (Jinja2 + FastAPI):** Simplest option but poor interactivity for the QR scanner and raffle animation.

**Consequences:**
- (+) File-based routing enables rapid page creation
- (+) SSR/SSG provides fast initial loads on older smartphones
- (+) Tailwind utility classes speed up UI development without custom CSS
- (+) TypeScript interfaces can mirror Pydantic schemas for end-to-end type safety
- (+) Free deployment on Vercel with zero configuration
- (-) Team needs working knowledge of React and TypeScript
- (-) Two languages in the stack (TypeScript + Python) increases context switching

---

## ADR-002: Python with FastAPI for Backend

**Status:** Accepted

**Context:**
The backend serves a REST API for guest management, attendance tracking, and raffle logic. The team needed a framework that is quick to learn, has strong documentation, and provides automatic API documentation — useful for a school project where grading involves demonstrating the system. Python is taught at GIBZ, so all team members are familiar with it.

**Decision:**
Use Python 3.12+ with FastAPI, SQLAlchemy 2.0 as ORM, and Pydantic v2 for request/response validation. The API is served via Uvicorn.

**Alternatives Considered:**
- **Django REST Framework:** More batteries-included but heavier. The built-in ORM is tightly coupled and overkill for 4 tables. Steeper learning curve for the team.
- **Flask:** Simpler but lacks automatic OpenAPI docs, built-in validation, and async support.
- **Node.js + Express:** Would enable a single-language stack with the frontend, but the team is more comfortable with Python. No auto-generated Swagger UI.

**Consequences:**
- (+) Auto-generated Swagger UI at `/docs` — excellent for demos and grading
- (+) Pydantic validation catches malformed input with zero boilerplate
- (+) Python is familiar to all team members from school
- (+) Async support available if needed for future scalability
- (-) Two languages in the stack increases context switching
- (-) Deployment requires a Python runtime (not just static files)

---

## ADR-003: MySQL for Database

**Status:** Accepted

**Context:**
The application stores guest addresses, event data, attendance records, and raffle history. The data is clearly relational: guests attend events, draws reference guests and events. The dataset is small (hundreds of guests, not thousands). The team needed a database that is reliable, well-documented, and easy to set up.

**Decision:**
Use MySQL 8.4 as the relational database, accessed via SQLAlchemy ORM.

**Current repo note:**
The repository currently bootstraps MySQL from `database/init/init.sql`. Alembic or another migration tool is not configured yet.

**Alternatives Considered:**
- **PostgreSQL:** Equally capable, but MySQL is more commonly taught at GIBZ and has broader free-tier hosting availability.
- **SQLite:** Simplest option but does not support concurrent writes well. During the event, multiple club members may check in guests simultaneously from different devices.
- **MongoDB:** NoSQL is not a natural fit for this relational data model (guests → attendance → events, guests → raffle draws → events).

**Consequences:**
- (+) Strong referential integrity via foreign keys
- (+) Team familiarity from school coursework
- (+) Available on most free hosting platforms (PlanetScale, Railway)
- (+) SQLAlchemy abstracts MySQL-specific quirks
- (-) Requires a running database server (unlike SQLite)
- (-) Schema migrations still need dedicated tooling if the schema grows beyond the current bootstrap SQL

---

## ADR-004: QR Code-Based Guest Identification

**Status:** Accepted

**Context:**
Returning guests (80%+ of attendees) currently receive pre-printed paper slips with an ID number. Club members manually look up these IDs in Excel during the event. This process takes 30+ seconds per guest and creates bottlenecks. The solution needs to make check-in as fast as possible.

**Decision:**
Each guest receives a unique UUID stored as a QR code. The QR code is:
1. Displayed on the guest's phone after registration (to save/screenshot)
2. Printed on next year's postal invitation (replacing the old paper slip with ID)

At the event, club members scan the QR code using the admin dashboard's camera-based scanner, which instantly retrieves the guest record and confirms check-in with one tap.

**Consequences:**
- (+) Check-in takes 2–3 seconds per guest (scan + confirm) vs. 30+ seconds manually
- (+) QR codes work offline on the guest's phone (saved image)
- (+) Same QR code can be printed on postal invitations for guests without smartphones
- (+) UUID prevents sequential ID guessing
- (-) Requires camera access on the check-in device (laptop webcam or phone)
- (-) Older guests may not understand how to save/show a QR code — fallback name search is essential

---

## ADR-005: Shared Password Authentication for Admin Dashboard

**Status:** Accepted

**Context:**
The admin dashboard must be protected so only club members can access guest data, perform check-ins, and run the raffle. However, the customer (STV Ennetbürgen) has no IT knowledge and the system must be immediately usable. A full user management system with individual accounts, password resets, and role-based access is overkill for a sports club with ~10 active members.

**Decision:**
Keep authentication intentionally simple for the school-project scope and avoid full user management complexity.

**Current repo note:**
The implemented backend currently uses a minimal email/password login against the MySQL `users` table and returns basic user data. Shared-password auth and JWT issuance are not implemented in the current code.

**Alternatives Considered:**
- **Individual user accounts:** More secure and auditable, but adds significant development time for registration, password reset, and user management — none of which the customer would maintain.
- **OAuth (Google/GitHub):** Requires all club members to have accounts on an external provider. Too complex for the target user.
- **No auth (local network only):** Risky if the event WiFi is shared with guests.

**Consequences:**
- (+) Dead simple to set up and explain to the customer
- (+) No user management overhead
- (+) A deliberately simple auth setup keeps onboarding manageable for club members
- (+) Minimal auth complexity keeps the school-project scope under control
- (-) No audit trail of which club member performed which action
- (-) Centralized or overly simple credentials reduce auditability and increase blast radius if leaked
- (-) Not suitable for production beyond the club's internal use — acceptable for this scope

---

## ADR-006: Monorepo with Separate Frontend and Backend

**Status:** Accepted

**Context:**
The project has two distinct codebases (Next.js frontend and FastAPI backend) that need to be developed, tested, and deployed independently. The team considered separate repositories but decided the overhead of managing multiple repos, cross-repo CI triggers, and separate issue tracking was not justified for a 5-week school project with 4 people.

**Decision:**
Use a monorepo with top-level directories: `/frontend` (Next.js app) and `/backend` (FastAPI app). Each has its own dependency management, Dockerfile, and validation commands. Documentation lives in `/docs` at the root.

```
super-lottomatch/
├── .github/workflows/ # CI/CD pipeline
├── docker-compose.yml # Local development environment
├── frontend/          # Next.js + React + TypeScript + Tailwind
├── backend/           # Python + FastAPI + SQLAlchemy
├── database/init/     # MySQL init scripts
├── docs/              # Project documentation
└── .claude/           # Claude Code configuration
```

**Consequences:**
- (+) Single repository — one set of issues, PRs, and CI config
- (+) Atomic commits can span frontend and backend
- (+) Simpler onboarding for team members
- (-) Larger repository over time
- (-) CI installs both dependency sets even when only one side changed (can optimize with path filters later)

---

## ADR-007: Atomic Design for Frontend Component Architecture

**Status:** Accepted

**Context:**
As the frontend grew beyond the login page, components accumulated inside feature folders (e.g. `components/Login/`) with no clear rules on what can import what. New components had no obvious home, and duplication started creeping in. The team needed a convention that scales with the codebase and makes PR reviews faster.

**Decision:**
Adopt Brad Frost's Atomic Design methodology adapted for Next.js App Router. Components are organised into five tiers under `frontend/src/components/`:

```
components/
├── atoms/          # Button, Input, Label, IconButton, NavItem
├── molecules/      # FormField, NavActions, SidebarHeader, SidebarNav
├── organisms/      # LoginForm, AdminHero, Footer, Sidebar, TopNavbar
└── templates/      # LoginTemplate, DashboardTemplate
```

Pages remain in `app/` as the fifth tier (Next.js convention). Dependencies flow strictly downward: atoms import nothing, molecules import atoms, organisms import both, templates import all three.

Each component lives in its own folder (`atoms/NavItem/NavItem.tsx`) with a barrel `index.ts` for clean imports (`@/components/atoms/NavItem`).

**Consequences:**
- (+) Clear dependency rule eliminates "where does this go?" debates
- (+) Shared vocabulary (atom/molecule/organism/template) speeds up PR reviews
- (+) Folder-per-component leaves room for colocated tests and stories
- (+) Barrel exports keep import paths clean
- (-) More folders and files than a flat structure
- (-) Requires discipline — misplaced components break the hierarchy

See `docs/ATOMIC-DESIGN.md` for the full specification.

---

## ADR-008: shadcn/ui as Component Primitive Layer

**Status:** Accepted

**Context:**
The project initially built all UI components from scratch (custom Button, Input, etc.). As the dashboard grew to include a navbar, sidebar, and action buttons, maintaining custom primitives with proper variants, accessibility, and focus management became time-consuming. The team needed a pre-built component system that integrates with Tailwind CSS v4 and does not add a runtime dependency.

**Decision:**
Adopt shadcn/ui as the primitive component layer. shadcn components are installed into `frontend/src/components/ui/` as source code (not an npm dependency), built on Base UI React and class-variance-authority (CVA) for variants.

Atomic design components wrap shadcn primitives with domain-specific meaning:
- `ui/button.tsx` (shadcn primitive) → used directly or wrapped by atoms like `IconButton`
- Custom atoms (`Input`, `Label`) remain where shadcn does not yet cover them

**Alternatives Considered:**
- **Continue custom-only:** Full control but slow — every new variant needs manual implementation of focus rings, disabled states, aria attributes.
- **Radix UI directly:** Lower-level than shadcn, requires more boilerplate for styling.
- **Material UI / Chakra UI:** Runtime CSS-in-JS dependencies, heavier bundle, opinionated styling that conflicts with the existing Tailwind theme.

**Consequences:**
- (+) Pre-built variants (ghost, outline, destructive, link) with proper accessibility
- (+) Source code ownership — components live in the repo and can be customised
- (+) Zero runtime dependency — just Tailwind classes
- (+) CVA provides type-safe variant props
- (-) Adds `class-variance-authority`, `clsx`, `tailwind-merge`, `tw-animate-css` as dependencies
- (-) shadcn's CSS variable system required merging with the project's existing custom tokens

---

## ADR-009: Dashboard Layout with Sidebar Navigation and Top Navbar

**Status:** Accepted

**Context:**
After login, users land on a dashboard that needs navigation to multiple sections: events, guests, check-in, prizes, data, and settings. The target users (club members, 40+) need a layout that is immediately recognisable and easy to navigate. A sidebar with labelled icons is the most familiar pattern for admin dashboards.

**Decision:**
The dashboard uses a two-part layout composed as a template (`DashboardTemplate`):

1. **Top navbar** (`TopNavbar` organism) — spans full width, contains "STV Event Manager" branding on the left, and action buttons (Import/Export, notifications, profile) on the right.
2. **Left sidebar** (`Sidebar` organism) — sits below the navbar, contains a user/org header, navigation links with lucide-react icons, and a "New Event" CTA button at the bottom.

The layout is applied via a Next.js nested layout at `app/dashboard/layout.tsx`, so it wraps all `/dashboard/*` routes without affecting the login page.

Navigation items are defined as a constant array (`NAV_ITEMS` in `lib/constants.ts`) and rendered by the `SidebarNav` molecule. Active state detection uses `usePathname()`.

**Consequences:**
- (+) Familiar admin dashboard pattern — no learning curve for users
- (+) Nested layout means login page stays separate with its own layout
- (+) Navigation config is data-driven — adding a new section is one line in `constants.ts`
- (+) Active state highlighting gives clear orientation
- (-) Fixed desktop-oriented sidebar still makes the dashboard primarily a desktop-first experience, even though individual pages now include responsive layouts

---

## ADR-010: Centralised Constants and Configuration

**Status:** Accepted

**Context:**
API base URLs and navigation item definitions were scattered across individual components (`LoginForm`, `SidebarNav`). This made it easy to introduce inconsistencies and harder to find configuration values during debugging or deployment.

**Decision:**
Extract shared constants into `frontend/src/lib/constants.ts`:
- `API_BASE_URL` — reads from `NEXT_PUBLIC_API_URL` env var with `http://localhost:8000` fallback
- `MAPBOX_TOKEN` — reads from `NEXT_PUBLIC_MAPBOX_TOKEN`
- `NAV_ITEMS` — typed array of sidebar navigation entries (href, icon, label)

Components import from this single source of truth.

**Consequences:**
- (+) Single place to update API URLs or navigation structure
- (+) Type-safe — `NavItem` interface enforces shape
- (+) Easier to find and audit configuration values
- (-) One more import per consuming component (minimal overhead)
