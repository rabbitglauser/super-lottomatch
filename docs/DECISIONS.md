# Architecture Decision Records

**Date:** 2026-03-31
**Status:** Ratified

This document records the critical architectural decisions made during the development of SuperLottomatch. Every choice reflects an evaluation of trade-offs between developer velocity, user experience, and system reliability within the constraints of a 5-week school project (GIBZ M426).

---

## ADR-001: Next.js with React, TypeScript, and Tailwind CSS for Frontend

**Status:** Accepted

**Context:**
The application needs two frontends: a public guest registration app and a protected admin dashboard. Both must work cross-platform, be mobile-friendly, and serve an audience where the majority is aged 40+. The team has 5 weeks and 2 developers, so developer velocity is critical. The guest app must load fast on older smartphones.

**Decision:**
Use Next.js 14+ (App Router) with React, TypeScript, and Tailwind CSS. The guest app and admin dashboard are separate route groups within the same Next.js project.

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
Use MySQL 8.0+ as the relational database, accessed via SQLAlchemy ORM. Schema migrations are managed with Alembic.

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
- (-) Schema migrations need tooling (Alembic)

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
Use a single shared password for admin access, set via environment variable. On login, the backend issues a JWT token valid for 24 hours (covering one full event day). No user registration, no email verification, no password reset flow.

**Alternatives Considered:**
- **Individual user accounts:** More secure and auditable, but adds significant development time for registration, password reset, and user management — none of which the customer would maintain.
- **OAuth (Google/GitHub):** Requires all club members to have accounts on an external provider. Too complex for the target user.
- **No auth (local network only):** Risky if the event WiFi is shared with guests.

**Consequences:**
- (+) Dead simple to set up and explain to the customer
- (+) No user management overhead
- (+) JWT tokens are stateless, no session storage needed
- (+) 24-hour expiry aligns with event duration
- (-) No audit trail of which club member performed which action
- (-) Shared password means if it leaks, all admin access is compromised
- (-) Not suitable for production beyond the club's internal use — acceptable for this scope

---

## ADR-006: Monorepo with Separate Frontend and Backend

**Status:** Accepted

**Context:**
The project has two distinct codebases (Next.js frontend and FastAPI backend) that need to be developed, tested, and deployed independently. The team considered separate repositories but decided the overhead of managing multiple repos, cross-repo CI triggers, and separate issue tracking was not justified for a 5-week school project with 4 people.

**Decision:**
Use a monorepo with top-level directories: `/frontend` (Next.js app) and `/backend` (FastAPI app). Each has its own dependency management (`package.json` / `requirements.txt`), test suite, and Dockerfile. The CI pipeline runs both test suites. Documentation lives in `/docs` at the root.

```
super-lottomatch/
├── frontend/          # Next.js + React + TypeScript + Tailwind
├── backend/           # Python + FastAPI + SQLAlchemy
├── docs/              # Project documentation
├── .github/workflows/ # CI/CD pipeline
├── docker-compose.yml # Local development environment
└──.claude/skills      # Claude API key
```

**Consequences:**
- (+) Single repository — one set of issues, PRs, and CI config
- (+) Atomic commits can span frontend and backend
- (+) Simpler onboarding for team members
- (-) Larger repository over time
- (-) CI installs both dependency sets even when only one side changed (can optimize with path filters later)
