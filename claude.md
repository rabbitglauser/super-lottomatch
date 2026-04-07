# Development Guidelines — SuperLottomatch

This document contains critical information about working with this codebase. Follow these guidelines precisely.

## Project Overview

SuperLottomatch digitizes the annual Lottomatch raffle for STV Ennetbürgen. It replaces manual paper slips and Excel spreadsheets with a web-based system for guest registration, QR-code check-in, and automated raffle draws.

- **Module:** M426 — Software mit agilen Methoden entwickeln (GIBZ Zug)
- **Team:** Sammy (PO), Amarah (SM), Benji (Dev), Oddy (Dev)
- **Client:** STV Ennetbürgen
- **Target users:** Majority aged 40+, German-speaking

## System Architecture

Monorepo with three services orchestrated via Docker Compose:

```
super-lottomatch/
├── frontend/          # Next.js 16 (React 19, TypeScript 5, Tailwind 4)
├── backend/           # Python FastAPI (Uvicorn, SQLAlchemy, Pydantic)
├── db/init/           # MySQL 8.4 init scripts (Docker entrypoint)
├── docs/              # Project documentation (PRD, ADRs, Scrum, etc.)
├── .github/workflows/ # GitHub Actions CI/CD
└── docker-compose.yml # Local dev: frontend :3001, backend :8000, MySQL :3306
```

### Data Flow

1. **Registration:** Guest fills form -> backend creates guest + address -> generates UUID guest_code -> returns QR
2. **Check-in:** QR scanned (or manual lookup) -> check-in stored per event_day -> duplicate check enforced
3. **Raffle:** Admin selects prize -> backend queries distinct checked-in guests -> random selection -> stores draw

## Core Components

### Backend (`backend/`)

- `main.py`: FastAPI app entry point
- `routers/`: API endpoint modules (auth, guests, checkins, draws, events)
- `services/`: Business logic (raffle_service, guest_service, export_service)
- `models/`: SQLAlchemy ORM models (Guest, Address, LottoEvent, EventDay, CheckIn, Prize, Draw)
- `schemas/`: Pydantic request/response validation
- `database.py`: Database connection setup
- `config.py`: Configuration management
- `tests/`: pytest test suite

### Frontend (`frontend/src/`)

- `app/layout.tsx`: Root layout with fonts and global styles
- `app/page.tsx`: Home page
- Guest pages: Registration form, QR confirmation, returning guest lookup
- Admin pages: Login, guest list, check-in station, raffle draw, event management

### Database

- MySQL 8.4 with tables: guests, addresses, lotto_events, event_days, checkins, prizes, draws, mail_campaigns
- Init scripts in `db/init/` run via Docker entrypoint

## Package Management

### Backend (Python)

- Install: `pip install -r requirements.txt`
- Add a dependency: add to `requirements.txt`, then `pip install -r requirements.txt`
- Run server: `uvicorn main:app --reload` (from `backend/`)

### Frontend (Node.js)

- Install: `npm install` (from `frontend/`)
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`

## Code Quality

### Backend

- Type hints required for all Python code
- Public APIs must have docstrings
- Functions must be focused and small
- Line length: 88 chars maximum
- PEP 8 naming (snake_case for functions/variables)
- Class names in PascalCase
- Constants in UPPER_SNAKE_CASE
- Use f-strings for formatting

### Frontend

- Strict TypeScript (no `any`)
- Follow Tailwind CSS conventions
- Use Pydantic-style validation schemas on the backend for all request/response models

## Code Formatting

### Backend (Ruff)

- Format: `ruff format .`
- Check: `ruff check .`
- Fix: `ruff check . --fix`
- Critical issues: line length (88 chars), import sorting (I001), unused imports
- Line wrapping: use parentheses for strings, multi-line function calls with proper indent

### Frontend (ESLint)

- Check: `npm run lint` (runs ESLint 9 with next config)

## Testing

### Backend

- Framework: `pytest` with `pytest-asyncio` (asyncio_mode=auto)
- Test client: `httpx.AsyncClient` with `ASGITransport`
- Coverage: `pytest --cov=. --cov-report=term-missing`
- Run: `cd backend && pytest`
- Test database: SQLite in-memory (no external DB needed)
- Coverage target: >75% (CI-enforced)

### Frontend

- Framework: Jest + React Testing Library
- Run: `cd frontend && npm test`
- Coverage: `npm test -- --coverage`
- Coverage target: >75% (CI-enforced)

### Requirements

- New features require tests
- Bug fixes require regression tests
- All tests must pass before pushing

## CI/CD

- Pipeline: GitHub Actions (`.github/workflows/ci.yml`)
- Triggers: push to any branch, pull requests to any branch
- Stages: Install -> Lint -> Test -> Coverage Check (>75%) -> Build -> Deploy (main only)
- Frontend and backend stages run in parallel
- Deployment: Vercel (frontend), Railway/Render (backend), PlanetScale/Railway (MySQL)

## Local Development

```bash
# Start all services (frontend :3001, backend :8000, MySQL :3306)
docker compose up -d

# Or run individually:
cd backend && pip install -r requirements.txt && uvicorn main:app --reload
cd frontend && npm install && npm run dev
```

Environment variables are in `.env` (MYSQL_ROOT_PASSWORD, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD).

## Git Conventions

### Branch Naming

| Prefix | Use Case |
|--------|----------|
| `feature/` | New functionality |
| `bugfix/` | Bug fixes |
| `hotfix/` | Urgent production fixes |
| `refactor/` | Code restructuring |
| `docs/` | Documentation changes |
| `test/` | Adding or updating tests |
| `chore/` | CI, dependencies, tooling |

### Commit Messages

Use a prefix tag in square brackets:

```
[feature] add guest registration form
[bugfix] fix duplicate check-in on same event
[docs] update API contracts
[test] add unit tests for raffle draw logic
[chore] update GitHub Actions workflow
```

- For commits fixing bugs or adding features based on user reports add:
  ```bash
  git commit --trailer "Reported-by:<name>"
  ```
  Where `<name>` is the name of the user.

- For commits related to a Github issue, add:
  ```bash
  git commit --trailer "Github-Issue:#<number>"
  ```

- NEVER ever mention a `co-authored-by` or similar aspects. In particular, never
  mention the tool used to create the commit message or PR.

### Pull Requests

- Never push directly to `main`. All changes go through pull requests.
- Create a detailed message focused on the high-level problem and solution.
  Don't go into code specifics unless it adds clarity.
- Wait for CI to pass and get at least one team member review before merging.
- Delete the branch after merging.
- NEVER ever mention a `co-authored-by` or similar aspects. In particular, never
  mention the tool used to create the commit message or PR.

## Development Philosophy

- **Simplicity**: Write simple, straightforward code
- **Readability**: Make code easy to understand
- **Performance**: Consider performance without sacrificing readability
- **Maintainability**: Write code that's easy to update
- **Testability**: Ensure code is testable
- **Reusability**: Create reusable components and functions
- **Less Code = Less Debt**: Minimize code footprint

## Coding Best Practices

- **Early Returns**: Use to avoid nested conditions
- **Descriptive Names**: Use clear variable/function names (prefix handlers with "handle")
- **Constants Over Functions**: Use constants where possible
- **DRY Code**: Don't repeat yourself
- **Functional Style**: Prefer functional, immutable approaches when not verbose
- **Minimal Changes**: Only modify code related to the task at hand
- **Function Ordering**: Define composing functions before their components
- **TODO Comments**: Mark issues in existing code with "TODO:" prefix
- **Simplicity**: Prioritize simplicity and readability over clever solutions
- **Build Iteratively**: Start with minimal functionality and verify it works before adding complexity
- **Run Tests**: Test your code frequently with realistic inputs and validate outputs
- **Functional Code**: Use functional and stateless approaches where they improve clarity
- **Clean Logic**: Keep core logic clean and push implementation details to the edges
- **File Organisation**: Balance file organization with simplicity

## Error Resolution

1. CI Failures — fix in this order:
    1. Formatting (ruff format / ESLint)
    2. Type errors
    3. Linting (ruff check / ESLint)
2. Common Issues:
    - Line length: break strings with parentheses, multi-line function calls, split imports
    - Types: add None checks, narrow string types, match existing patterns
3. Best Practices:
    - Check git status before commits
    - Run formatters before type checks
    - Keep changes minimal
    - Follow existing patterns
    - Test thoroughly
