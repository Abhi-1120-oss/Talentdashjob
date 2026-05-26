# TalentDash — one-command local dev startup
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "=== TalentDash Dev Startup ===" -ForegroundColor Cyan

# 1. Ensure .env exists
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example"
}

# 2. Start PostgreSQL (Docker)
Write-Host "`n[1/5] Starting PostgreSQL..." -ForegroundColor Yellow
docker compose -f docker-compose.dev.yml up -d postgres 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker failed. Install Docker Desktop OR run Postgres manually on port 5432." -ForegroundColor Red
    Write-Host "Set DATABASE_URL in .env to your Postgres connection string."
    exit 1
}

Write-Host "Waiting for Postgres to be ready..."
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    docker compose -f docker-compose.dev.yml exec -T postgres pg_isready -U talentdash -d talentdash 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    Start-Sleep -Seconds 1
}
if (-not $ready) {
    Write-Host "Postgres did not become ready in time." -ForegroundColor Red
    exit 1
}
Write-Host "PostgreSQL is ready." -ForegroundColor Green

# 3. Prisma setup
Write-Host "`n[2/5] Running Prisma generate + db push..." -ForegroundColor Yellow
$env:DATABASE_URL = "postgresql://talentdash:talentdash@localhost:5432/talentdash?schema=public"
prisma generate 2>&1 | Out-Null
prisma db push --skip-generate 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Prisma db push failed." -ForegroundColor Red
    exit 1
}

# 4. Seed sample data
Write-Host "`n[3/5] Seeding sample data..." -ForegroundColor Yellow
$env:PYTHONPATH = "src"
python scripts/seed_sample_data.py

# 5. Start API
Write-Host "`n[4/5] Starting API server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Web App:    http://127.0.0.1:8000/app" -ForegroundColor Green
Write-Host "  API Docs:   http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host "  OpenAPI:    http://127.0.0.1:8000/openapi.json" -ForegroundColor Green
Write-Host "  Health:     http://127.0.0.1:8000/health" -ForegroundColor Green
Write-Host "  Salaries:   http://127.0.0.1:8000/api/v1/salaries" -ForegroundColor Green
Write-Host ""
Write-Host "[5/5] Press Ctrl+C to stop the server." -ForegroundColor Yellow
Write-Host ""

python -m uvicorn talentdash.api.main:app --host 127.0.0.1 --port 8000 --reload
