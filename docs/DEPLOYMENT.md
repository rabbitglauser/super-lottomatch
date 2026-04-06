# Deployment — SuperLottomatch


**Date:** 2026-06-04
**Status:** In Development

## Overview

SuperLottomatch uses **GitHub Actions** for CI/CD. Every push triggers the pipeline; deployments to production happen automatically when changes are merged to `main`.

---

## CI/CD Pipeline

### Trigger

| Event | Branches | Action |
|-------|----------|--------|
| `push` | All branches | Run full pipeline |
| `pull_request` | All branches | Run full pipeline |
| Merge to `main` | `main` | Run pipeline + deploy |

### Pipeline Stages

```
┌──────────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌─────────┐    ┌──────────┐
│   Install    │───▶│   Lint   │───▶│   Test   │───▶│   Coverage   │───▶│  Build  │───▶│  Deploy  │
│    Deps      │    │          │    │          │    │   Check      │    │         │    │(main only)│
└──────────────┘    └──────────┘    └──────────┘    └──────────────┘    └─────────┘    └──────────┘
```

| Stage | Frontend | Backend |
|-------|----------|---------|
| **Install** | `npm install` | `pip install -r requirements.txt` |
| **Lint** | ESLint (`npm run lint`) | Ruff (`ruff check .`) |
| **Test** | Jest (`npm test`) | pytest (`pytest`) |
| **Coverage** | Fail if < 75% | Fail if < 75% |
| **Build** | `npm run build` (Next.js) | N/A (interpreted) |
| **Deploy** | Vercel auto-deploy | Railway/Render auto-deploy |

Frontend and backend stages run **in parallel** to speed up the pipeline.

---

## Deployment Targets

| Component | Platform | Tier | Trigger |
|-----------|----------|------|---------|
| **Frontend** (Next.js) | Vercel | Free | Auto-deploy on push to `main` |
| **Backend** (FastAPI) | Railway or Render | Free | Auto-deploy on push to `main` |
| **Database** (MySQL 8.0) | PlanetScale or Railway | Free | Persistent — no redeployment |

### Environment Variables

All secrets are stored in **GitHub Actions Secrets** (see [SECURITY.md](../SECURITY.md)):

| Variable | Where Used | Description |
|----------|-----------|-------------|
| `ANTHROPIC_API_KEY` | GitHub Actions | Claude API key (if applicable) |
| `DATABASE_URL` | Backend (Railway/Render) | MySQL connection string |
| `JWT_SECRET` | Backend (Railway/Render) | Secret for signing admin JWT tokens |
| `ADMIN_PASSWORD` | Backend (Railway/Render) | Shared admin login password |
| `NEXT_PUBLIC_API_URL` | Frontend (Vercel) | Backend API base URL |

---

## How a Release Works

1. Developer creates a feature branch (`feature/my-feature`) and pushes code.
2. GitHub Actions runs the full pipeline (lint, test, coverage, build).
3. Developer opens a Pull Request to `main`.
4. At least one team member reviews and approves the PR.
5. PR is merged to `main`.
6. GitHub Actions runs the pipeline again on `main`.
7. If all checks pass:
   - Vercel auto-deploys the frontend.
   - Railway/Render auto-deploys the backend.
8. The new version is live.

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

If a deployment causes issues:

1. **Frontend (Vercel):** Use the Vercel dashboard to redeploy a previous build instantly.
2. **Backend (Railway/Render):** Redeploy the previous commit from the platform dashboard.
3. **Database:** Migrations are forward-only. If a migration is broken, write a corrective migration rather than rolling back.
4. **Emergency:** Revert the merge commit on `main` and push — this triggers a clean redeploy of the last working state.
