# API Reference — SuperLottomatch

**Date:** 2026-04-25
**Status:** Current implementation

This document only covers the API that is actually implemented in `backend/main.py`.

## Base URL

Local development:

- `http://localhost:8000`

There is currently no `/api` prefix in the backend routes.

## CORS

The FastAPI app currently allows browser requests from:

- `http://localhost:3000`
- `http://localhost:3001`

## Endpoints

### `GET /`

Health-style root endpoint used by tests and quick environment checks.

Response:

```json
{
  "message": "Backend is running"
}
```

### `POST /auth/login`

Looks up a user by email in the MySQL `users` table and compares the submitted password to the stored `password` column.

Request body:

```json
{
  "email": "samuel.glauser@gmail.com",
  "password": "123"
}
```

Success response:

```json
{
  "id": 1,
  "name": "Samuel Glauser",
  "email": "samuel.glauser@gmail.com"
}
```

Error response:

```json
{
  "detail": "Ungültige Zugangsdaten"
}
```

Status codes:

- `200` on success
- `401` on invalid credentials

## Database dependency

`POST /auth/login` depends on the MySQL connection configured in `backend/database.py` and the seeded `users` table created by `database/init/init.sql`.

## Known limitations

- Passwords are currently stored and compared in plain text.
- No JWT/session token is issued yet.
- No guest, event, check-in, prize, or reporting endpoints are currently implemented in the backend.

For target-state or historical planning API ideas, see `docs/PRD.md`, but treat this file as the source of truth for the live repository.
