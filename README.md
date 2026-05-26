# TalentDash — Compensation Intelligence Ingestion Platform

India-first salary intelligence ingestion pipeline. Transforms scraped compensation data into structured, validated, deduplicated records ready for analytics.

**Core principle:** Structured data → Comparable → Decision-ready.

## Architecture

```
Scrape → Extract → Normalize → Validate → Dedupe → Score → Store → Report
```

| Stage | Module | Description |
|-------|--------|-------------|
| Scrape | `scrapers/` | Playwright async scrapers (AmbitionBox, Glassdoor) |
| Extract | `extraction/` | Regex/HTML parsing, salary normalization (₹/LPA) |
| Normalize | `normalization/` | GPT-4o-mini batch normalization with Pydantic validation |
| Levels | `levels/` | Hybrid rule-based title → level mapping |
| Validate | `validation/` | Strict Pydantic ingest contract |
| Dedupe | `dedupe/` | Hash + fuzzy company + time window |
| Score | `scoring/` | Weighted confidence with explainable breakdown |
| Store | `storage/` | Async Prisma + Neon PostgreSQL |
| Report | `reporting/` | Quality metrics JSON + console |
| API | `api/` | Public read API + ingest endpoint |
| Web UI | `frontend/` | React SPA (Vite + Tailwind + shadcn-style components) |

### Client access (Web, Mobile, Android, iOS)

| Platform | How to access |
|----------|----------------|
| **Web browser** | Open `http://localhost:8000/` |
| **Mobile web** | Same URL — responsive React app |
| **Android app** | REST API (`/api/v1/*`) or WebView → `/` |
| **iOS app** | REST API (`/api/v1/*`) or WKWebView → `/` |

**Public read API** (no auth): `GET /api/v1/salaries`, `/companies`, `/stats`, `/filters`

See [docs/MOBILE_API.md](docs/MOBILE_API.md) for Kotlin, Swift, React Native, and Flutter examples.

### Execution modes

1. **CLI pipeline:** `python -m talentdash.pipeline.run`
2. **Worker:** `python -m talentdash.queue.worker` (Redis or in-process queues)
3. **API + Web:** `.\scripts\start_api.ps1` → http://localhost:8000/

## Quick start (fastest — no database required)

```powershell
cd talentdash
pip install -r requirements.txt
pip install -e .
cd frontend && npm install && npm run build && cd ..
.\scripts\start_api.ps1
```

Then open:
- **Web app:** http://127.0.0.1:8000/
- **Explore:** http://127.0.0.1:8000/explore
- **API docs:** http://127.0.0.1:8000/docs

Sample data (12 records) is served automatically if PostgreSQL is not running.

### Frontend dev (hot reload)

```powershell
# Terminal 1
.\scripts\start_api.ps1

# Terminal 2
.\scripts\start_frontend.ps1
# → http://localhost:5173
```

## Full setup (with PostgreSQL)

```bash
cd talentdash
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
pip install -e .
playwright install chromium

cp .env.example .env
# Edit DATABASE_URL, OPENAI_API_KEY

# With Docker Desktop:
.\scripts\start_dev.ps1

# Or manually:
prisma generate
prisma db push
python scripts/seed_sample_data.py
python -m talentdash.pipeline.run
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | required | Neon PostgreSQL connection string |
| `OPENAI_API_KEY` | — | OpenAI API key for normalization |
| `QUEUE_BACKEND` | `asyncio` | `asyncio` or `redis` |
| `REDIS_URL` | `redis://localhost:6379` | Redis for multi-worker |
| `DEDUPE_WINDOW_DAYS` | `30` | Duplicate detection window |
| `HUMAN_REVIEW_THRESHOLD` | `0.65` | Flag records below this confidence |
| `API_KEY` | — | `X-API-Key` header for ingest API |

## Sample records

**Raw scrape:**
```json
{
  "company": "Infosys",
  "role": "Software Engineer",
  "salary_range": "₹8-12 LPA",
  "location": "Bangalore",
  "experience": "3-5 years",
  "source": "ambitionbox"
}
```

**Normalized ingest:**
```json
{
  "company": "infosys",
  "role": "Software Engineer",
  "level_standardized": "l4",
  "location": "bangalore",
  "experience_years": 4.0,
  "base_salary": 1000000.0,
  "bonus": 0,
  "stock": 0,
  "total_compensation": 1000000.0,
  "confidence_score": 0.78
}
```

`total_compensation` is always computed server-side (`base + bonus + stock`).

## Public API (read — all clients)

```bash
# Search salaries (web, mobile, Android, iOS)
curl "http://localhost:8000/api/v1/salaries?company=google&location=bangalore&page=1"

# Company summaries
curl "http://localhost:8000/api/v1/companies"

# Filter options for UI dropdowns
curl "http://localhost:8000/api/v1/filters"

# Platform stats
curl "http://localhost:8000/api/v1/stats"
```

## Ingest API (write — requires API key)

```bash
curl -X POST http://localhost:8000/api/ingest-salary \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "records": [{
      "company": "flipkart",
      "role": "Software Engineer",
      "level_standardized": "l5",
      "location": "bangalore",
      "experience_years": 6,
      "base_salary": 3500000,
      "confidence_score": 0.9,
      "source": "api"
    }]
  }'
```

Response includes per-item `accepted`, `rejected`, or `duplicate` status.

## Design decisions

- **Monolith-first:** Single deployable Python service; no Kubernetes/microservices.
- **Validation-first:** Never persist raw LLM JSON; always pass through Pydantic.
- **Prisma + Neon:** Schema-as-code with async Python client.
- **Queue abstraction:** In-process asyncio queues by default; Redis for horizontal workers.
- **Scraper resilience:** Per-record failures never abort the run; adaptive rate limiting on 403/429.

## Tradeoffs and limitations

- Scrapers depend on third-party DOM structure; breakage is expected — monitor `scraper.blocks` metrics.
- LLM normalization adds latency/cost; rule-based fallback marks records for human review.
- Fuzzy dedupe uses conservative thresholds to limit false positives.
- Legal: respect site terms; use conservative rate limits in production.

## Debugging

- Quality reports: `reports/{run_id}.json`
- Rejection logs: `rejection_log` table
- Duplicate skips: `duplicate_log` table
- Low confidence: `human_review_queue` table
- Logs: structured JSON to stdout (`run_id`, `stage` fields)

```bash
# Scrape only
python scripts/run_scraper.py

# Skip scrape (normalize existing data)
python -m talentdash.pipeline.run --skip-scrape

# Health check
curl http://localhost:8000/health
```

## Docker

```bash
docker compose -f deploy/docker-compose.yml up --build
```

## Testing

```bash
cd talentdash
PYTHONPATH=src pytest tests/unit -v
PYTHONPATH=src pytest tests/integration -v
```

## Future improvements

- pg_trgm fuzzy company index
- Cached company name normalization
- Additional sources (Naukri, LinkedIn)
- Admin UI for human review queue
- Prometheus exporter sidecar

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for production deploy steps.
