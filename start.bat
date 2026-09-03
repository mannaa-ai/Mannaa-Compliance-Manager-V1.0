@echo off
title ANMAT Full Compliance Manager - Setup & Launch
echo ==========================================================
echo    ANMAT FULL COMPLIANCE MANAGER - AUTOMATED SETUP
echo    23 Standards ^| 1,639 Controls ^| Offline IndexedDB Vault
echo ==========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed! Please install Node.js (v18+) from https://nodejs.org
    pause
    exit /b %errorlevel%
)

echo [1/3] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install npm dependencies.
    pause
    exit /b %errorlevel%
)
echo [OK] Dependencies installed.
echo.

echo [2/3] Verifying and building application...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build verification failed.
    pause
    exit /b %errorlevel%
)
echo [OK] Build verification passed!
echo.

echo [3/3] Launching Compliance Manager Web Application...
echo ==========================================================
echo  Application is running at: http://localhost:5173
echo  Press Ctrl+C anytime to stop.
echo ==========================================================
echo.

call npm run dev
pause
