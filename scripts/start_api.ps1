# Start TalentDash API + React web app
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
}

if (-not (Test-Path "frontend/dist/index.html")) {
    Write-Host "Building React frontend..." -ForegroundColor Yellow
    Push-Location frontend
    npm install
    npm run build
    Pop-Location
}

$env:PYTHONPATH = "src"
$env:DATABASE_URL = "postgresql://talentdash:talentdash@localhost:5432/talentdash?schema=public"

Write-Host ""
Write-Host "  TalentDash starting..." -ForegroundColor Cyan
Write-Host ""
Write-Host "  Web App:    http://127.0.0.1:8000/" -ForegroundColor Green
Write-Host "  Explore:    http://127.0.0.1:8000/explore" -ForegroundColor Green
Write-Host "  API Docs:   http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host "  Health:     http://127.0.0.1:8000/health" -ForegroundColor Green
Write-Host ""

python -m uvicorn talentdash.api.main:app --host 127.0.0.1 --port 8000 --reload
