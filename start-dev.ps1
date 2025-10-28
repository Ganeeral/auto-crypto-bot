# start-dev.ps1
Write-Host "Запуск Trading Bot в режиме разработки..." -ForegroundColor Green

# Запуск PostgreSQL
Write-Host "Запуск PostgreSQL..." -ForegroundColor Yellow
docker run --name trading-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=trading_bot -p 5432:5432 -d postgres:16-alpine

# Ожидание запуска БД
Start-Sleep -Seconds 5

# Запуск Backend в новом окне
Write-Host "Запуск Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run start:dev"

# Ожидание запуска Backend
Start-Sleep -Seconds 10

# Запуск Frontend в новом окне
Write-Host "Запуск Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "Все сервисы запущены!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:3000" -ForegroundColor Cyan
