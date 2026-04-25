# Project Scope — SuperLottomatch

**Date:** 2026-04-25
**Status:** Archived planning scope

**Module:** M426 (GIBZ)  
**Team:** Sammy (PO), Amarah (SM), Benji (Dev), Oddy (Dev)  
**Duration:** 5 weeks / 5 sprints  
**Client:** STV Ennetbürgen

---

> This file captures the original project scope and backlog intent.
> It is not the source of truth for what is already implemented in the repository today.
>
> Current implementation highlights:
> - dashboard routes for events, guests, check-in, prizes, analytics, and settings are present in the frontend with mock data
> - the backend currently exposes only `GET /` and `POST /auth/login`
> - QR scanning, AI chatbot features, and automated notification flows are not implemented in the current backend

## Project Goal

Digitalize the annual Lottomatch raffle event by replacing manual paper slips and Excel spreadsheets with a web-based system for guest registration, QR-code check-in, and automated raffle draws.

---

## In Scope

### Core Features (Must Have)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Guest Registration** | Mobile-friendly form for new guests (Vorname, Nachname, Strasse, PLZ, Ort). Generates a personal QR code on submission. |
| 2 | **Returning Guest Check-in** | Returning guests enter their last name or scan the QR code from their invitation letter to confirm attendance. |
| 3 | **QR Code Generation** | Each registered guest receives a unique QR code (UUID v4) that can be saved or screenshotted for use at the event. |
| 4 | **QR Code Scanning** | Admin dashboard uses the device camera to scan guest QR codes at the event for instant check-in (<5 seconds). |
| 5 | **Admin Guest Management** | Searchable/filterable guest list with inline editing. CSV export for postal mail merge. |
| 6 | **Attendance Tracking** | Real-time view of who has checked in per event day. Duplicate check-in prevention. |
| 7 | **Raffle Draw** | Random draw from checked-in guests. Draw history to prevent duplicate winners. Animated reveal. |
| 8 | **Address Cleanup** | List guests not attended in 3+ years. Bulk archive/delete before next year's invitations. |
| 9 | **Admin Authentication** | Shared password login with JWT token (valid 24h). No individual accounts needed. |

### Extended Features (Should Have)

| # | Feature | Description |
|---|---------|-------------|
| 10 | **AI Chatbot** | An AI-powered chatbot (using the Claude API) embedded in the guest app to answer frequently asked questions about the event — e.g. date, location, how to register, what to bring. Reduces support burden on club members. |
| 11 | **Multi-Day Event Support** | Guests can attend Day 1, Day 2, or both. Raffle can draw from a specific day or across both days. |

### Nice to Have (Could Have)

| # | Feature | Description |
|---|---------|-------------|
| 12 | **Email Notifications** | Send confirmation emails after registration and reminders before the event. |
| 13 | **Guest Self-Service** | Returning guests can update their own address via their QR code link. |
| 14 | **Analytics Dashboard** | Attendance statistics, year-over-year trends, raffle history. |

---

## Out of Scope (Won't Have)

| Feature | Reason |
|---------|--------|
| Payment processing | Lottomatch tickets are handled separately at the event |
| Individual admin accounts | Only ~10 club members, shared password is sufficient |
| Native mobile app | Mobile-responsive web app covers the use case |
| Multi-language support | All users are German-speaking |
| SMS notifications | Postal mail is the primary marketing channel |
| Offline mode | Venue has reliable WiFi |

---

## Technical Scope

### System Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Guest App | Next.js | Public-facing registration and check-in |
| Admin Dashboard | Next.js | Guest management, QR scanning, raffle draw |
| Backend API | Python FastAPI | REST API, business logic, authentication |
| Database | MySQL 8.0 | Persistent storage |
| CI/CD | GitHub Actions | Automated testing, linting, deployment |

### QR Code Scanning

- Uses the device camera via the admin dashboard (browser-based, no native app required)
- Libraries: `html5-qrcode` or `react-qr-reader`
- Fallback: manual name lookup if camera is unavailable
- Scanned QR code triggers an API call to check in the guest instantly

### AI Integration (Chatbot)

- **API:** Claude API (Anthropic) via `@anthropic-ai/sdk`
- **Scope:** Read-only assistant that answers event-related questions
- **Data:** Fed with event details (date, location, schedule, FAQ) — no access to guest data
- **Placement:** Floating chat widget on the guest app
- **Guardrails:** Limited to event topics, no personal data exposure
- **API Key:** Stored in GitHub Actions Secrets / backend environment variable, never exposed to the frontend. All chatbot requests are proxied through the backend API.

---

## Constraints

| Constraint | Detail |
|------------|--------|
| **Timeline** | 5 weeks (1 sprint per week) |
| **Team size** | 4 people |
| **Budget** | Free-tier hosting only (Vercel, Railway/Render, PlanetScale) |
| **Target users** | Majority aged 40+, limited tech experience |
| **Accessibility** | Min 18px font, 48px touch targets, WCAG AA contrast |
| **Language** | German UI throughout |
| **Test coverage** | Minimum 75% line coverage (CI-enforced) |

---

## Deliverables

| # | Deliverable | Format |
|---|-------------|--------|
| 1 | Working guest registration + QR code app | Deployed web app |
| 2 | Working admin dashboard with QR scanning + raffle | Deployed web app |
| 3 | Backend API with all endpoints | Deployed API |
| 4 | Automated CI/CD pipeline | GitHub Actions |
| 5 | Test suite with >75% coverage | pytest + Jest |
| 6 | Project documentation | Markdown in `/docs` |
| 7 | Scrum artifacts (backlog, board, retros) | GitHub Projects + `/docs/SCRUM.md` |
