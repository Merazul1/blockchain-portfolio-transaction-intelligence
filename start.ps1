# Startup script for Blockchain Portfolio & Transaction Intelligence

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Starting Blockchain Portfolio & Transaction Intelligence" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# Start Backend
Write-Host "Starting Backend API Server on http://localhost:5000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; node server.js"

Start-Sleep -Seconds 2

# Start Frontend
Write-Host "Starting Frontend Dev Server on http://localhost:3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Servers started!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5000/api/health" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
