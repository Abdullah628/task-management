# Task Management System

full-stack task management app with:
- NestJS + Prisma backend
- Next.js frontend
- PostgreSQL database
- Docker Compose orchestration

## Quick Start (No Local Dependency Install)

Requirements:
- Docker Desktop (or Docker Engine + Compose v2)

From repository root, run:

```bash
docker compose up --build
```

That command will:
1. Start PostgreSQL
2. Build backend and frontend images
3. Run Prisma migrations automatically
4. Seed demo users automatically
5. Start backend and frontend containers

Open:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000

## Demo Credentials

| Role  | Email             | Password  |
|-------|-------------------|-----------|
| Admin | admin@taskapp.com | admin@123 |
| User  | user@taskapp.com  | user@123  |

## Docker Services

- `db`: PostgreSQL 16 with persistent named volume
- `migrate`: one-off migration + seed job (`prisma migrate deploy` + seed)
- `backend`: NestJS API on port `3000`
- `frontend`: Next.js app on port `3001`

## Useful Commands

Start full stack:

```bash
docker compose up --build
```

Start only database:

```bash
docker compose up db
```

Run in background:

```bash
docker compose up --build -d
```

Stop stack:

```bash
docker compose down
```

Stop and remove DB data volume:

```bash
docker compose down -v
```

## Environment Notes

- Backend is wired to PostgreSQL via Compose service DNS (`db`).
- Frontend calls backend via `NEXT_PUBLIC_API_URL=http://localhost:3000`.
- For production, replace `JWT_SECRET` in `docker-compose.yml` with a secure secret manager flow.

## Live Demo

Frontend: https://your-app.vercel.app  
Backend: https://your-api.railway.app