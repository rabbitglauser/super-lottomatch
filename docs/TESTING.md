# Testing Strategy — SuperLottomatch

**Date:** 2026-06-04
**Status:** In Development

## Overview

SuperLottomatch currently uses a pragmatic validation approach in CI:

- **Frontend:** linting plus production build verification
- **Backend:** linting plus pytest smoke tests

Additional frontend tests and coverage gates can be added as the product grows.

---

## Current CI Validation

| Component | Current CI Checks | Tool |
|-----------|-------------------|------|
| Backend (FastAPI) | Ruff + pytest | `ruff`, `pytest` |
| Frontend (Next.js) | ESLint + Next.js build | `eslint`, `next build` |

---

## Backend Testing

### Tools

| Tool | Purpose |
|------|---------|
| **ruff** | Linting and static checks |
| **pytest** | Test runner and framework |
| **pytest-cov** | Coverage reporting |
| **httpx** | Async test client for FastAPI endpoints |

### How to Run

```bash
# Run all backend tests
cd backend
pip install -r requirements.txt
ruff check .
pytest

# Run with coverage report
pytest --cov=. --cov-report=term-missing

# Run a specific test file
pytest tests/test_main.py

# Run with verbose output
pytest -v
```

### Current Implementation Status

The current backend test suite is a minimal FastAPI smoke-test setup for the existing `main.py` app:

- `backend/tests/conftest.py` provides a shared async `httpx` client fixture
- `backend/tests/test_main.py` verifies the root endpoint response
- Additional endpoint, database, and service tests can be added as the backend grows

### What's Covered

| Area | Tests | Priority |
|------|-------|----------|
| Guest CRUD | Create, read, update, delete guests via API | High |
| Attendance | Check-in, duplicate prevention (unique constraint), attendance history | High |
| Raffle Draw | Random draw from checked-in guests only, exclusion of already-drawn winners | High |
| Authentication | Password validation, JWT generation, token expiry | High |
| Input Validation | Pydantic schema validation for all endpoints (missing fields, wrong types) | Medium |
| CSV Export | Correct format and content of guest list export | Medium |
| Edge Cases | Empty database, invalid IDs, concurrent check-ins | Low |

### Test Database

- The current smoke test does **not** require a live database connection
- The SQLAlchemy engine is created from environment defaults, but the test only exercises the root endpoint
- Broader database-backed tests can be added once dedicated test fixtures are introduced

### Example Test Structure

```
backend/tests/
├── conftest.py           # Shared fixtures (test client, DB session)
├── test_guests.py        # Guest CRUD endpoints
├── test_attendance.py    # Check-in and attendance endpoints
├── test_raffle.py        # Raffle draw logic
├── test_auth.py          # Authentication endpoints
└── test_export.py        # CSV export
```

---

## Frontend Testing

### Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Static analysis and code quality |
| **Next.js build** | Compile-time validation of the app |

### How to Run

```bash
# Install dependencies
cd frontend
npm install
npm run lint -- src
npm run build
```

### Current Coverage

The current frontend workflow validates:

- TypeScript and Next.js production compilation
- ESLint rules
- import resolution and route compilation
- configuration issues that would break the production build

Frontend component and interaction tests are **not implemented yet** in this repository.

### Planned Future Frontend Test Areas

- Registration and check-in flows
- Guest management filters and imports
- Dashboard widgets and page routing
- Reusable UI components and form behavior

---

## Integration Testing

Integration tests verify that the full API works end-to-end with a real database layer:

- The current repository only includes a lightweight backend smoke test
- Full workflow integration tests are a planned extension, not yet implemented

---

## Running All Tests

```bash
# Backend
cd backend && ruff check . && pytest

# Frontend
cd frontend && npm run lint -- src && npm run build

# Both (from project root)
cd backend && ruff check . && pytest && cd ../frontend && npm run lint -- src && npm run build
```

---

## Writing New Tests

When adding a new feature, follow this checklist:

- [ ] Write unit tests for new business logic
- [ ] Write API tests for new endpoints (backend)
- [ ] Add frontend component tests once a frontend test runner is introduced
- [ ] Keep lint/build/test checks green in CI
- [ ] All tests pass locally before pushing
