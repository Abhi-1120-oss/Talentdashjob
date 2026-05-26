# Deploy TalentDash on Vercel

This repo is configured for **one-click Vercel deploy**: React UI + **static CDN data** (no Python serverless — fast and reliable).

## Quick deploy (GitHub)

1. Push code to https://github.com/Abhi-1120-oss/Talentdashjob
2. Go to [vercel.com/new](https://vercel.com/new) → **Import** your repo
3. Vercel reads [`vercel.json`](../vercel.json) automatically:
   - **Build:** `frontend` (Vite)
   - **API:** `api/index.py` (Python serverless)
4. Click **Deploy**

No environment variables are required for the demo (mock data).

## What runs on Vercel

| Part | URL | Notes |
|------|-----|--------|
| Web app | `/`, `/explore`, `/compare`, … | Static React SPA |
| Data | `/data/bundle.json` | 12 sample salary records (cached 1 year) |

`VITE_STATIC_API=true` is set in `vercel.json` so the app filters data in the browser — no `/api` calls.

## Optional environment variables

| Variable | Purpose |
|----------|---------|
| `CORS_ORIGINS` | Comma-separated allowed origins (default `*`) |
| `VITE_API_BASE` | Only if API is on another host (e.g. Render) |

## Full backend (PostgreSQL, scrapers, ingest)

Vercel serverless is **not** suitable for Playwright scrapers, long pipelines, or Prisma + Postgres at scale.

Host the full API on **Render**, **Railway**, or **Fly.io**, then set in Vercel:

```
VITE_API_BASE=https://your-api.example.com
```

Redeploy the frontend.

## Local check before deploy

```powershell
cd frontend
npm ci
npm run build
cd ..
# Install Vercel CLI: npm i -g vercel
vercel
```

## Troubleshooting

- **404 on `/explore`** — SPA rewrites are in `vercel.json`; redeploy after pulling latest `main`.
- **API errors** — Open `/health` on your Vercel URL; should return `"database": "mock (Vercel serverless)"`.
- **Empty data** — Mock mode is intentional without Postgres; connect a real API via `VITE_API_BASE`.
