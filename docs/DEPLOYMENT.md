# Deployment — SuperLottomatch


**Date:** 2026-06-04
**Status:** In Development

## Overview

SuperLottomatch uses **GitHub Actions** for CI/CD. Every push and pull request triggers automated validation, and every push to `main` creates a packaged release bundle on GitHub.

---

## CI/CD Pipeline

### Trigger

| Event | Branches | Action |
|-------|----------|--------|
| `push` | All branches | Run CI validation |
| `pull_request` | All branches | Run CI validation |
| `push` to `main` | `main` | Run validation + create release bundle |

### Pipeline Stages

```
┌──────────────┐    ┌──────────┐    ┌──────────┐    ┌─────────┐    ┌──────────────┐
│   Install    │───▶│   Lint   │───▶│   Test   │───▶│  Build  │───▶│ Release Bundle│
│    Deps      │    │          │    │          │    │         │    │  (main only)  │
└──────────────┘    └──────────┘    └──────────┘    └─────────┘    └──────────────┘
```

| Stage | Frontend | Backend |
|-------|----------|---------|
| **Install** | `npm ci` | `python3 -m pip install -r requirements.txt` |
| **Lint** | ESLint (`npm run lint -- src`) | Ruff (`python3 -m ruff check .`) |
| **Test** | Not configured yet | pytest (`python3 -m pytest`) |
| **Build** | `npm run build` (Next.js) | N/A (interpreted) |
| **Release** | Zip bundle attached to GitHub Release | Zip bundle attached to GitHub Release |

Frontend and backend stages run **in parallel** to speed up the pipeline.

---

## Delivery Target

The repository currently implements **automated release bundling on `main`** rather than direct web-server deployment from GitHub Actions.

| Component | Delivery Type | Trigger |
|-----------|---------------|---------|
| **Frontend** (Next.js) | GitHub release zip bundle | Push to `main` |
| **Backend** (FastAPI) | GitHub release zip bundle | Push to `main` |
| **Combined package** | GitHub release zip bundle | Push to `main` |

This satisfies the CI/CD requirement by automatically packaging the application into release bundles whenever code lands on the release branch.

### Environment Variables

The current release workflow relies only on the built-in **`GITHUB_TOKEN`** to publish GitHub releases:

| Variable | Where Used | Description |
|----------|-----------|-------------|
| `GITHUB_TOKEN` | GitHub Actions | Publish the release tag and upload bundle assets |

---

## How a Release Works

1. Developer creates a feature branch (`feature/my-feature`) and pushes code.
2. GitHub Actions runs the CI workflow (frontend lint/build and backend lint/tests).
3. Developer opens a Pull Request to `main`.
4. At least one team member reviews and approves the PR.
5. PR is merged to `main`.
6. GitHub Actions runs validation again on `main`.
7. If all checks pass:
   - frontend, backend, and combined project bundles are zipped
   - a GitHub Release is created automatically
   - the zip bundles are attached to that release
8. The release bundle is available for download and deployment.

---

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.12+
- Docker & Docker Compose (for database)

### Setup

```bash
# Clone the repository
git clone https://github.com/rabbitglauser/super-lottomatch.git
cd super-lottomatch

# Start MySQL via Docker Compose
docker compose up -d

# Backend
cd backend
python -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (in a separate terminal)
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`, the backend on `http://localhost:8000`.

---

## Rollback

If a release bundle causes issues:

1. Download and redeploy the previous GitHub release bundle.
2. Revert the merge commit on `main` and push — this triggers a fresh release bundle of the last corrected state.
3. Database migrations remain forward-only. If a migration is broken, write a corrective migration rather than rolling back.
