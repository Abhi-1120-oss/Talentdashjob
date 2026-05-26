# Vite dev server (proxies API to :8000)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..\frontend
if (-not (Test-Path "node_modules")) { npm install }
Write-Host "Frontend dev: http://localhost:5173" -ForegroundColor Green
Write-Host "Start API separately: ..\scripts\start_api.ps1" -ForegroundColor Yellow
npm run dev
