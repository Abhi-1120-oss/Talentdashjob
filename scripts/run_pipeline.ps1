# TalentDash pipeline runner
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not (Test-Path ".env")) {
    Write-Warning "No .env file found. Copy .env.example to .env and configure DATABASE_URL."
}

$env:PYTHONPATH = "src"
python -m talentdash.pipeline.run @args
