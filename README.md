# AI-Powered Procurement Standards & Compliance Copilot (SpectraIS)

Phase 1 production-grade foundation layer for Government Procurement Officers, offering Bureau of Indian Standards (BIS) indexing, tender compliance verification, role-based access control, and audit tracking.

---

## Tech Stack Overview

- **Frontend**: Next.js 15 App Router, TypeScript, TailwindCSS, Zustand, React Query
- **Backend**: FastAPI, Python 3.12, SQLAlchemy 2.0 (Async), Alembic, Pydantic v2
- **Database**: PostgreSQL 16 (13 Tables, UUID Primary Keys)
- **Caching & Rate Limiting**: Redis 7
- **Containerization**: Docker & Docker Compose

---

## Architecture Highlights

1. **Clean Architecture**: Decoupled `api` -> `services` -> `repositories` -> `models/schemas` pattern.
2. **RBAC Security**: 5 Roles (`SUPER_ADMIN`, `ORG_ADMIN`, `PROCUREMENT_OFFICER`, `APPROVER`, `AUDITOR`).
3. **Sliding JWT Tokens**: Short-lived Access Tokens (15 min) + Refresh Tokens (7 days) with Redis token revocation blacklisting.
4. **BIS Standards Engine**: Complete CRUD, search, filtering, and version history.

---

## Quickstart Guide

### 1. Running with Docker Compose (Recommended)

```bash
# Clone repository and launch containers
docker-compose up --build -d
```

Access services:
- **Frontend Dashboard**: `http://localhost:3000`
- **FastAPI Backend Docs**: `http://localhost:8000/api/v1/docs`

### 2. Manual Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install .

# Run Alembic migrations and seed data
alembic upgrade head
python scripts/seed_data.py

# Start dev server
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## Default Admin Credentials (Seeded)

- **Email**: `admin@mohua.gov.in`
- **Password**: `Admin123!`
- **Role**: `SUPER_ADMIN` / `ORG_ADMIN`
