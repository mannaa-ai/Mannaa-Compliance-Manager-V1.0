#!/usr/bin/env bash
set -e

echo "=========================================================="
echo "   ANMAT FULL COMPLIANCE MANAGER - AUTOMATED SETUP        "
echo "   23 Standards | 1,639 Controls | Offline IndexedDB Vault "
echo "=========================================================="
echo ""

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed! Please install Node.js (v18+) from https://nodejs.org"
    exit 1
fi

echo "[1/3] Installing dependencies..."
npm install

echo "[2/3] Verifying and building application..."
npm run build

echo "[3/3] Launching Compliance Manager Web Application..."
echo "=========================================================="
echo " Application running at: http://localhost:5173"
echo " Press Ctrl+C anytime to stop."
echo "=========================================================="
echo ""

npm run dev
