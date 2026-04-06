# USER STORIES

**Date:** 2026-06-04
**Status:** Ratified


This file contains the user stories for the Super-Lottomatch project. Each story is written in the standard format (As a <role>, I want <goal> so that <benefit>), plus clear Acceptance Criteria, Definition of Done, Priority and an initial size estimate.

---

## Epics and Groups
- Authentication & Users
- Event & Raffle Management
- Guest Management
- QR Ticketing & Check-in System
- AI assistant & automation
- Admin Dashboard & Reporting
- Notifications & Communications
- Security, Privacy & Compliance
- Infrastructure & Deployment

---

## Authentication & Users

US-001 - User registration
- As a new user, I want to register an account so that I can manage raffles and guests.
- Acceptance Criteria:
    - User can register with email + password and required fields (name, organization).
    - Email verification link is sent and must be used to activate the account.
    - Password must meet strong password rules.
- Definition of Done:
    - Registration endpoint, validations, DB entry, email verification flow, UI form.
- Priority: High
- Estimate: M

US-002 - User login and session
- As a registered user, I want to log in so I can access my events and administration features.
- Acceptance Criteria:
    - Secure login with email + password and optional remember-me.
    - Invalid credentials show helpful error messages.
    - Sessions expire and can be logged out.
- DoD: Auth endpoints, session storage / JWT, UI flows.
- Priority: High
- Estimate: M

US-003 - Role-based access control
- As an admin, I want to assign roles (admin, event-manager, guest) so that users have the correct permissions.
- Acceptance Criteria:
    - Roles exist and map to permissions.
    - Only admins can assign roles.
    - Protected UI/actions require appropriate roles.
- DoD: Role model, middleware enforcement, UI admin panel for role assignment.
- Priority: High
- Estimate: M

---

## Event & Raffle Management

US-010 - Create event
- As an event manager, I want to create an event (name, date, location, settings) so that I can manage raffles and guests for that event.
- Acceptance Criteria:
    - Event form supports basic metadata, raffle configuration, capacity.
    - Event is persisted and visible in my dashboard.
- DoD: API, DB schema, UI create/edit forms, validations.
- Priority: High
- Estimate: M

US-011 - Configure raffle rules
- As an event manager, I want to define raffle rules (prize types, number of winners, entry criteria) so the raffle runs correctly.
- Acceptance Criteria:
    - UI to add prizes, counts, eligibility rules.
    - Rule validation prevents invalid config.
- DoD: UI, backend validation, read-only view for participants.
- Priority: High
- Estimate: M

US-012 - Run raffle and draw winners
- As an event manager, I want to trigger a raffle draw and see winners so I can announce them.
- Acceptance Criteria:
    - Draw action selects winners according to rules.
    - Draw is auditable (timestamp, seed, who triggered it).
    - Winners listed and exportable.
- DoD: Secure draw algorithm, endpoint, UI, audit log, export CSV.
- Priority: High
- Estimate: L

---

## Guest Management

US-020 - Add and import guests
- As an event manager, I want to add single guests and import guest lists (CSV) so I can prepare the guest list.
- Acceptance Criteria:
    - Single-guest add form with required fields (name, email, ticket type).
    - CSV import with clear mapping and error reporting.
- DoD: Import parser, UI feedback, DB entries.
- Priority: High
- Estimate: M

US-021 - Guest profile and status
- As an event manager, I want to view and edit guest profiles and see check-in status so I can manage attendance.
- Acceptance Criteria:
    - Guest profile shows metadata, ticket, QR code (if issued), check-in status.
    - Can update guest details and ticket assignment.
- DoD: Guest profile UI, update endpoints, history of changes.
- Priority: High
- Estimate: M

US-022 - Guest search and filters
- As an event manager, I want to search and filter guests (by name, ticket type, checked-in) so I can find guests quickly.
- Acceptance Criteria:
    - Fast search with partial matching and filters for status, ticket.
    - Paginated results and export option.
- DoD: Search endpoint, UI, tests.
- Priority: Medium
- Estimate: S

---

## QR Ticketing & Check-in System

US-030 - Issue QR tickets
- As an event manager, I want the system to generate a unique QR ticket for each guest so they can check in with a scanner.
- Acceptance Criteria:
    - System generates a secure QR payload per issued ticket.
    - QR can be printed or sent by email.
- DoD: QR generation service, link to guest profile, email templates.
- Priority: High
- Estimate: M

US-031 - Mobile check-in scanner
- As a door staff, I want a mobile-friendly scanner view to scan QR codes and mark guests as checked-in so check-in is fast.
- Acceptance Criteria:
    - Mobile page uses camera to scan QR.
    - Scanning validates ticket, shows guest name, and marks check-in.
    - Re-scan shows warning if already checked-in.
- DoD: Mobile UI, camera permission handling, backend check-in endpoint, error handling.
- Priority: High
- Estimate: M

US-032 - Offline-capable check-in
- As a door staff, I want scanning to work when offline and sync later so check-ins don't fail with poor connectivity.
- Acceptance Criteria:
    - Scanner caches check-in actions locally and syncs when online.
    - Conflicts handled consistently (timestamp-based, last-one-wins with audit trail).
- DoD: Local cache strategy, sync endpoint, conflict resolution docs.
- Priority: Medium
- Estimate: L

US-033 - QR security & anti-fraud
- As an organizer, I want QR codes to be tamper-resistant and single-use so they cannot be fraudulently reused.
- Acceptance Criteria:
    - QR payload contains signed token or one-time nonce.
    - Reuse attempts are logged and blocked.
- DoD: Token signing, verification middleware, logging, tests.
- Priority: High
- Estimate: M

---

## AI assistant & automation (new systems requested)

US-040 - AI: Smart guest deduplication and enrichment
- As an event manager, I want the system to detect duplicate guest records and suggest merges and enrich profile data (when sources available) so my guest list is clean.
- Acceptance Criteria:
    - AI flags likely duplicates with confidence score and suggested merge fields.
    - AI can suggest missing country/organization from email or public sources (opt-in only).
- DoD: AI microservice stub + rules, UI for review, opt-in settings, privacy compliance.
- Priority: Medium
- Estimate: L

US-041 - AI: Smart raffle seeding & fairness analysis
- As an organizer, I want AI to analyze raffle settings and simulate draws to identify fairness issues or biases so I can adjust rules.
- Acceptance Criteria:
    - AI runs Monte-Carlo simulations and surfaces potential edge cases.
    - Clear UI summary with recommendations.
- DoD: Simulation API, dashboard widget, documentation.
- Priority: Low
- Estimate: L

US-042 - AI: Auto replies & assistant for support
- As a support agent, I want an AI assistant that drafts responses to common guest inquiries (check-in, ticket issues) so I can handle support faster.
- Acceptance Criteria:
    - AI suggests reply drafts in the support UI with source context.
    - Agent can accept/edit/send.
- DoD: AI integration (configurable), UI suggestions, audit trail of sent replies.
- Priority: Medium
- Estimate: M

US-043 - AI: Attendance prediction & capacity alerts
- As an event manager, I want the AI to predict attendance from RSVPs and historical data and alert me when capacity thresholds might be exceeded.
- Acceptance Criteria:
    - Weekly forecast and alerting when predicted attendance > threshold.
    - Explanation of main drivers (recent signups, cancellations).
- DoD: Prediction pipeline, alerting mechanism, UI.
- Priority: Low
- Estimate: L

Notes on AI:
- All AI features must be opt-in per event and must explicitly document what data is sent to external models. Provide privacy controls and an on/off toggle per event.

---

## Admin Dashboard & Reporting

US-050 - Dashboard overview
- As an admin, I want a dashboard showing upcoming events, check-in stats, raffle status, and alerts so I can get a quick overview.
- Acceptance Criteria:
    - Key metrics: total guests, checked-in, winners, alerts.
    - Links to drill down to event and guest lists.
- DoD: Dashboard backend endpoints, frontend widgets.
- Priority: High
- Estimate: M

US-051 - Reports & exports
- As an event manager, I want to export guest lists, check-in logs, and raffle results as CSV so I can archive and analyze them.
- Acceptance Criteria:
    - Exports respect data filters and date ranges.
    - Exports include audit fields (timestamps, performed by).
- DoD: Export endpoints, UI, role checks.
- Priority: High
- Estimate: S

---

## Notifications & Communications

US-060 - Email invitations & QR delivery
- As an event manager, I want to send invitations and deliver QR tickets by email so guests can receive their ticket and QR code.
- Acceptance Criteria:
    - Email templates support variables (guest name, event, QR link).
    - Delivery status tracked (sent/bounced).
- DoD: Email service integration, templates, tracking.
- Priority: High
- Estimate: M

US-061 - SMS notifications (optional)
- As an event manager, I want to optionally send SMS reminders to guests so they are reminded before the event.
- Acceptance Criteria:
    - SMS opt-in per guest, scheduling, delivery status.
- DoD: SMS provider integration (configurable), opt-in controls, rate limits.
- Priority: Medium
- Estimate: L

US-062 - In-app push / live updates
- As a user, I want live updates about raffle progress and announcements in the app so participants can follow along.
- Acceptance Criteria:
    - Real-time feed for event updates; critical messages highlighted.
- DoD: Websocket or push notification integration, UI feed.
- Priority: Medium
- Estimate: M

---

## Security, Privacy & Compliance

US-070 - Data privacy controls
- As an organizer, I want per-event privacy settings and guest consent capture so we comply with data regulations.
- Acceptance Criteria:
    - Consent capture on guest creation/import.
    - Export and deletion request handling per guest.
- DoD: Consent fields, deletion endpoints, audit trail.
- Priority: High
- Estimate: M

US-071 - Audit logging
- As an auditor, I want all critical actions (check-ins, draws, role changes) logged with timestamp and actor so actions are traceable.
- Acceptance Criteria:
    - Immutable audit logs accessible to admins.
    - Logs contain actor, action, target, timestamp, and reason when applicable.
- DoD: Logging backend, admin UI, retention policy.
- Priority: High
- Estimate: M

US-072 - Rate limiting & abuse protection
- As a platform owner, I want rate limits, CAPTCHA on public endpoints, and abuse detection for automated attacks.
- Acceptance Criteria:
    - Rate limiting configured for API and public endpoints.
    - Suspicious repeated scanning or registration flagged.
- DoD: Middleware, monitoring dashboards, alerting.
- Priority: Medium
- Estimate: M

---

## Infrastructure & Deployment

US-080 - Containerized deployment and docs
- As a devops engineer, I want the app to be buildable and deployable with Docker and documented so production deployment is reproducible.
- Acceptance Criteria:
    - Dockerfiles for services, docker-compose for local dev, CI pipeline for builds.
    - README with deployment steps.
- DoD: Dockerfiles, CI config, deployment doc.
- Priority: High
- Estimate: M

US-081 - Backups & restore
- As an admin, I want automated backups and tested restore procedures so data loss can be recovered.
- Acceptance Criteria:
    - Nightly backups, retention policy, and a restore runbook.
- DoD: Backup jobs, runbook, restore test executed.
- Priority: Medium
- Estimate: L

---

## Process & Next Steps
- Each user story above is intentionally written to be clear and actionable. For each story the Scrum Master can create a GitHub issue using the story title, copy the content from the Acceptance Criteria and Definition of Done into the issue body, and assign priority/estimate labels.
- Suggested labels: "user-story", "epic:<name>", "priority:high|medium|low", "size:S|M|L", "AI", "QR", "security".
- If you want, I can create GitHub issues for all these stories automatically and add the suggested labels — tell me and I will proceed.

---

Revision history:
- 2026-04-01: Initial comprehensive user stories including QR and AI features.
