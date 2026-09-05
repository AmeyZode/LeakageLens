#!/usr/bin/env bash

# LeakageLens Development Startup Script
# Starts FastAPI backend (port 8000) and Vite React frontend (port 3000)

set -e

# Check frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install --prefix frontend
fi

echo "Starting LeakageLens Backend API on http://127.0.0.1:8000..."
python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!

echo "Starting LeakageLens Frontend on http://localhost:3000..."
npm run dev --prefix frontend &
FRONTEND_PID=$!

cleanup() {
  echo ""
  echo "Shutting down LeakageLens dev servers..."
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  exit 0
}

trap cleanup INT TERM

echo ""
echo "=========================================================="
echo " LeakageLens is running!"
echo " - Web Interface: http://localhost:3000"
echo " - Backend API:   http://127.0.0.1:8000"
echo " - Swagger Docs:  http://127.0.0.1:8000/docs"
echo "=========================================================="
echo "Press Ctrl+C to stop both servers."

wait
