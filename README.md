# SuperLottomatch

A web application that digitalizes the annual Lottomatch raffle event for STV Ennetbürgen. Replaces manual paper slips and Excel spreadsheets with QR-code-based guest registration, instant check-in, and automated raffle draws.

**GIBZ M426 — Software mit agilen Methoden entwickeln**

## Team

| Role | Name |
|------|------|
| Product Owner | Sammy |
| Scrum Master | Amarah |
| Developer | Benji |
| Developer | Oddy |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | MySQL 8.0 |
| CI/CD | GitHub Actions |

## Project Structure

```
super-lottomatch/
├── frontend/          # Next.js app (Guest App + Admin Dashboard)
├── backend/           # FastAPI REST API
├── docs/              # Project documentation
├── .github/workflows/ # CI/CD pipeline
└── docker-compose.yml # Local development environment
```

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.12+
- MySQL 8.0+
- Docker & Docker Compose (optional, for local dev)

### Local Development with Docker

```bash
docker-compose up
```

### Manual Setup

**Backend:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in `/backend`:

```env
DATABASE_URL=mysql+pymysql://user:password@localhost:3306/superlottomatch
ADMIN_PASSWORD=your-admin-password
JWT_SECRET=your-jwt-secret
```

## Documentation

- [PRD — System Specification](docs/PRD.md)
- [Architecture Decision Records](docs/DECISIONS.md)

## License

See [LICENSE.md](LICENSE.md) for details.
