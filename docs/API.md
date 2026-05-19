# API Reference - SuperLottomatch

**Date:** 2026-05-08  
**Status:** Current implementation

This document covers the FastAPI routes implemented in `backend/main.py`.

## Base URL

Local development:

- `http://localhost:8000`

There is currently no `/api` prefix in the backend routes.

## Database

The backend uses PostgreSQL through SQLAlchemy. Local Docker configuration starts a PostgreSQL service and loads:

- `database/init/init.sql`
- `database/init/seed.sql`

Runtime connection settings are read from `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER`, and `DATABASE_PASSWORD`, or from `DATABASE_URL` when provided.

## Endpoints

### `GET /`

Health-style root endpoint.

Response:

```json
{
  "message": "Backend is running"
}
```

### `POST /auth/login`

Looks up an active user by email in the PostgreSQL `users` table and compares the submitted password to `password_hash`.

### `GET /dashboard`

Returns dashboard stats, latest event days, live update text, and location data derived from the latest `lotto_events` and `event_days` rows.

### `GET /guests`

Returns guest records with address city, latest participation date, marketing consent state, initials, and UI avatar tone.

### `PATCH /guests/{guest_id}/marketing`

Toggles `allow_email_marketing` for an active guest and returns the updated state.

### `GET /check-ins`

Returns the latest event day check-in dashboard, including all active guests and whether each guest has checked in for that event day.

### `POST /check-ins/{guest_id}`

Creates a manual check-in for the latest event day. If the guest is already checked in for that day, the existing check-in is returned.

### `GET /prizes`

Returns prizes for the latest event, derived KPI values, raffle overview data, and the next highlight prize.

### `GET /analytics`

Returns aggregate analytics derived from guests, check-ins, event days, draws, check-in methods, and marketing consent fields.

## Known Limitations

- Password verification still compares raw input to `password_hash`; real hash verification is not implemented yet.
- No JWT/session token is issued yet.
- Create/edit/delete workflows for guests, events, prizes, and draws are still mostly read-only in the UI.
