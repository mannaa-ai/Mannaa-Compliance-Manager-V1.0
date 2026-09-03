<#
.SYNOPSIS
    Automated Setup & Launch Script for ANMAT Compliance Manager
.DESCRIPTION
    Installs dependencies, builds the application, and starts the development / desktop server.
#>

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   ANMAT FULL COMPLIANCE MANAGER - AUTOMATED SETUP        " -ForegroundColor Green
Write-Host "   23 Standards | 1,639 Controls | Offline IndexedDB Vault " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
try {
    $nodeVer = node -v
    Write-Host "[OK] Node.js is installed: $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not found! Please install Node.js (v18+) from https://nodejs.org" -ForegroundColor Red
    Pause
    Exit
}

# 1. Install dependencies
Write-Host "[1/3] Installing project dependencies (npm install)..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install dependencies." -ForegroundColor Red
    Pause
    Exit
}
Write-Host "[OK] Dependencies successfully installed!" -ForegroundColor Green
Write-Host ""

# 2. Build verification
Write-Host "[2/3] Verifying and building project (npm run build)..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build verification failed." -ForegroundColor Red
    Pause
    Exit
}
Write-Host "[OK] Build passed with zero errors!" -ForegroundColor Green
Write-Host ""

# 3. Launch application
Write-Host "[3/3] Starting ANMAT Compliance Manager..." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " Application starting at: http://localhost:5173" -ForegroundColor Green
Write-Host " Press Ctrl+C in this window anytime to stop the server." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""

npm run dev
