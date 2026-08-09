# CatCal API

Node.js + Express + Prisma backend for the CatCal mobile app. Database: **Supabase PostgreSQL**.

## Local setup

```bash
cd backend
cp .env.example .env
# Edit .env with your Supabase DATABASE_URL and DIRECT_URL
npm install
npm run db:push
npm run dev
```

API runs at **http://localhost:3001**

## Health checks

- `GET /health` — API status
- `GET /health/db` — database connectivity

## Release / APK

See **[DEPLOY.md](../DEPLOY.md)** in the project root for:

1. Supabase SQL setup  
2. Deploying this API to Render  
3. Building the Android APK with EAS  

Production API URL (configured in `eas.json`): `https://catcal-api.onrender.com`

## Environment

Copy `backend/.env.example` and fill in values. Required for production:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase pooler URL with `sslmode=require` |
| `DIRECT_URL` | Supabase direct connection URL |
| `JWT_SECRET` | Random secret for auth tokens |
| `PORT` | Server port (Render sets this automatically) |
| `NODE_ENV` | Set to `production` when deployed |
| `RESEND_API_KEY` | Optional — password reset emails |

## Mobile app (local)

In the project root `.env`:

```
EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:3001
```

Use your computer's Wi‑Fi IP (not `localhost`) when testing on a physical phone.
