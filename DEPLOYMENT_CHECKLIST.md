# TalentDash Deployment Checklist

## Pre-deploy

- [ ] Copy `.env.example` to `.env` and set `DATABASE_URL` (Neon PostgreSQL)
- [ ] Set `OPENAI_API_KEY` for LLM normalization
- [ ] Set `API_KEY` for ingestion API authentication
- [ ] Run `prisma migrate deploy` against production database
- [ ] Run `playwright install chromium` on scrape hosts
- [ ] Verify `QUEUE_BACKEND` (`asyncio` single-process vs `redis` multi-worker)

## Deploy

- [ ] Build Docker image: `docker build -f deploy/Dockerfile -t talentdash .`
- [ ] Start services: `docker compose -f deploy/docker-compose.yml up -d`
- [ ] Verify `GET /health` returns database `ok`
- [ ] Verify `GET /metrics` exposes counters

## Post-deploy validation

- [ ] Run pipeline once: `python -m talentdash.pipeline.run`
- [ ] Confirm quality report JSON in `reports/{run_id}.json`
- [ ] POST sample batch to `/api/ingest-salary` with `X-API-Key`
- [ ] Confirm dedupe rejects duplicate submissions within window
- [ ] Review `human_review_queue` for low-confidence records

## CI/CD

- [ ] GitHub Actions CI passes on main branch
- [ ] Secrets configured: `DATABASE_URL`, `OPENAI_API_KEY` (deploy only)

## Production-readiness

- [ ] All LLM outputs validated via Pydantic before persist
- [ ] `total_compensation` computed server-side only
- [ ] Partial pipeline failures do not abort entire run
- [ ] No secrets committed to repository
