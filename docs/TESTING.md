# Testing Strategy — SuperLottomatch

**Date:** 2026-06-04
**Status:** In Development

## Overview

SuperLottomatch uses a layered testing approach covering unit tests, integration tests, and end-to-end validation. The target is **>75% line coverage** for both frontend and backend, enforced by CI.

---

## Coverage Target

| Component | Minimum Coverage | Tool |
|-----------|-----------------|------|
| Backend (FastAPI) | 75% | pytest-cov |
| Frontend (Next.js) | 75% | Jest --coverage |

The CI pipeline fails the build if coverage drops below the threshold.

---

## Backend Testing

### Tools

| Tool | Purpose |
|------|---------|
| **pytest** | Test runner and framework |
| **pytest-cov** | Coverage reporting |
| **httpx** | Async test client for FastAPI endpoints |

### How to Run

```bash
# Run all backend tests
cd backend
pip install -r requirements.txt
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

- Tests use an **SQLite in-memory database** for fast execution
- The test database is created and destroyed per test session
- No external database dependency needed to run tests

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
| **Jest** | Test runner and framework |
| **React Testing Library** | Component rendering and interaction |
| **@testing-library/user-event** | Simulating user interactions |

### How to Run

```bash
# Run all frontend tests
cd frontend
npm install
npm test

# Run with coverage report
npm test -- --coverage

# Run a specific test file
npm test -- tests/Registration.test.tsx

# Run in watch mode (during development)
npm test -- --watch
```

### What's Covered

| Area | Tests | Priority |
|------|-------|----------|
| Registration Form | Field validation, form submission, QR code display after registration | High |
| Check-in Flow | QR scan trigger, manual name lookup, confirmation screen | High |
| Admin Guest List | Table rendering, search and filter, inline editing | Medium |
| Admin Raffle | Draw button, winner display, draw history, redraw | Medium |
| Components | Buttons, inputs, modals render correctly with props | Medium |
| Routing | Correct pages render at correct routes | Low |

### Example Test Structure

```
frontend/__tests__/
├── components/
│   ├── Button.test.tsx
│   ├── QRCode.test.tsx
│   └── GuestTable.test.tsx
├── pages/
│   ├── Registration.test.tsx
│   ├── Checkin.test.tsx
│   └── AdminRaffle.test.tsx
└── utils/
    └── validation.test.ts
```

---

## Integration Testing

Integration tests verify that the full API works end-to-end with a real database layer:

- **FastAPI TestClient** with an in-memory SQLite database
- Tests cover complete workflows:
  1. Register a guest → receive QR code
  2. Create an event → check in the guest → verify attendance
  3. Draw a raffle winner → verify winner is from checked-in guests
  4. Attempt duplicate check-in → verify rejection

---

## Running All Tests

```bash
# Backend
cd backend && pytest --cov=. --cov-report=term-missing

# Frontend
cd frontend && npm test -- --coverage

# Both (from project root)
cd backend && pytest --cov=. && cd ../frontend && npm test -- --coverage
```

---

## Writing New Tests

When adding a new feature, follow this checklist:

- [ ] Write unit tests for new business logic
- [ ] Write API tests for new endpoints (backend)
- [ ] Write component tests for new UI elements (frontend)
- [ ] Verify coverage has not dropped below 75%
- [ ] All tests pass locally before pushing
