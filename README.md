<h1 align="center">
  <img
    src="https://github.com/user-attachments/assets/d62fb261-f036-4ef4-81a6-b4af5cf7d1e9"
    alt="SuperLottomatch"
    width="200"
  />
  <br/>
  Project Trace — SuperLottomatch
</h1>


<p align="center">
  Software mit agilen Methoden entwickeln<br/>
  made at the <strong>GIBZ for M426 2026</strong>.
</p>

<p align="center">
  <a href="https://foodflighttracker.com"><img src="https://img.shields.io/badge/Live-TBD.com-9eca45?style=for-the-badge" alt="Live Demo"/></a>
  <a href="[https://github.com/Nepomuk5665/food-flight-tracker/tree/main/docs](https://github.com/rabbitglauser/super-lottomatch/tree/main/docs)"><img src="https://img.shields.io/badge/Docs-Architektur-003a5d?style=for-the-badge" alt="Docs"/></a>
  <a href="https://www.figma.com/design/4XAMeiD6nuGZ4HwsxqE1gT/Untitled?node-id=0-1&p=f"><img src="https://img.shields.io/badge/Figma-Mockup-F24E1E?style=for-the-badge&logo=figma&logoColor=white" alt="Figma"/></a>
  <a href="https://www.notion.so/Cassandra-333e987f6a44807686f0f6a995211171?source=copy_link"><img src="https://img.shields.io/badge/Notion-Documentation-000000?style=for-the-badge&logo=notion&logoColor=white" alt="Notion"/></a>
</p>

live-frontend: https://superlottomatch.vercel.app/

live-Backend: https://super-lottomatch.onrender.com/

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
