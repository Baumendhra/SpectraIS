# Production Architecture Specification: AI-Powered Procurement Standards & Compliance Copilot (SpectraIS)

## 1. System Architecture Overview

SpectraIS is built from day one as an enterprise-grade, multi-tenant SaaS application designed to help government procurement officers identify applicable Bureau of Indian Standards (BIS), analyze tender specifications, detect compliance gaps, and generate audit-ready compliance reports.

```
                  +-------------------------------------------------+
                  |      Next.js 15 App Router Frontend             |
                  |  (TypeScript, TailwindCSS, React Query, Zustand) |
                  +------------------------+------------------------+
                                           |
                                           | HTTPS / REST APIs
                                           v
                  +-------------------------------------------------+
                  |       FastAPI Backend Gateway / Routers         |
                  |     (OpenAPI 3.1, Rate Limiter, CORS, RBAC)     |
                  +------------------------+------------------------+
                                           |
            +------------------------------+------------------------------+
            |                              |                              |
            v                              v                              v
  +------------------+           +-------------------+           +------------------+
  | Services Layer   |           | Repositories      |           | Redis Cache &    |
  | (Auth, BIS, Org, | <-------> | (SQLAlchemy 2.0   | <-------> | Token Blacklist  |
  | Tenders, Audit)  |           | Async CRUD Engine)|           | Rate Limiting    |
  +------------------+           +---------+---------+           +------------------+
                                           |
                                           v
                                 +-------------------+
                                 | PostgreSQL DB     |
                                 | (13 Tables, UUID) |
                                 +-------------------+
```

---

## 2. Directory Layout & Folder Structure Justification

### Backend Structure (`/backend`)
* `/app/core`: System-wide cross-cutting concerns (Security, Async DB Session Manager, Redis Client, Settings, RBAC Guards, Exception Handlers).
* `/app/models`: Declarative SQLAlchemy 2.0 async ORM models representing the 13 domain tables.
* `/app/schemas`: Pydantic v2 schemas for strict data validation, serialization, and OpenAPI documentation generation.
* `/app/repositories`: Clean Architecture data access layer encapsulating all DB query operations and async sessions.
* `/app/services`: Pure business logic and domain service functions, decoupled from API controllers.
* `/app/api/v1`: FastAPI endpoints handling HTTP request routing, parameter parsing, and response formatting.
* `/alembic`: Database migration environment and version control for zero-downtime schema evolution.

### Frontend Structure (`/frontend`)
* `/app`: Next.js 15 App Router pages and layouts (`(auth)` and `(dashboard)` route groups).
* `/components/ui`: Primitive design system components (Buttons, Cards, Inputs, Badges, Modals, Tables) built with TailwindCSS and Radix patterns.
* `/components/layout`: SaaS Shell components (Collapsible Sidebar, Header, Breadcrumbs, Tenant Switcher).
* `/store`: Global client-side state management using Zustand (Session, Access Tokens, Role permissions).
* `/lib`: HTTP API client with automated JWT sliding-refresh interceptors and format utilities.
* `/types`: Centralized TypeScript interfaces for domain entities and API schemas.

---

## 3. Role-Based Access Control (RBAC) Matrix

| Role | Standard Read | Standard Write/Edit | User Management | Org Management | Audit Trail |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **SUPER_ADMIN** | ✅ | ✅ | ✅ (All Orgs) | ✅ | ✅ |
| **ORG_ADMIN** | ✅ | ✅ | ✅ (Own Org) | ❌ | ❌ |
| **PROCUREMENT_OFFICER** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **APPROVER** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **AUDITOR** | ✅ | ❌ | ❌ | ❌ | ✅ |

---

## 4. Security Architecture

1. **Password Security**: Argon2id primary hashing algorithm (resistant to GPU/ASIC cracking) with automatic bcrypt migration fallback.
2. **JWT Sliding Token Rotation**: Access tokens expire in 15 minutes. Refresh tokens expire in 7 days. When a refresh token is exchanged, it is immediately blacklisted in Redis to prevent replay attacks.
3. **Database Security**: All primary keys utilize time-ordered UUIDv7 identifiers to eliminate ID enumeration attacks and maintain PostgreSQL B-Tree index performance.
4. **Rate Limiting**: Sliding window rate limiting implemented via Redis keys (`rate_limit:{ip}:{window}`).
5. **SQL Injection Protection**: 100% parameterized queries using SQLAlchemy 2.0 Async Engine.
