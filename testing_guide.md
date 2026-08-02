# Testing and Execution Guide - LeakageLens Backend

This document details how to run, test, and query the LeakageLens backend APIs, CLI, and unit test suites.

---

## 🐍 Prerequisites

Ensure you have installed the required dependencies. You can install them by running:
```bash
pip install -r requirements.txt
pip install fastapi uvicorn httpx pytest
```

---

## 🔌 Running the FastAPI Web API Server

Start the local development server using `uvicorn`:
```bash
uvicorn backend.main:app --reload --port 8000
```
- **Interactive Documentation (Swagger UI):** Open your browser and navigate to `http://127.0.0.1:8000/docs`. You can test all endpoints interactively from this UI page!
- **Alternative Redoc docs:** `http://127.0.0.1:8000/redoc`

---

## 🔍 Testing Endpoints via cURL / PowerShell

Here are commands you can run in your terminal to verify API operations:

### 1. Health Status Check
**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health" -Method Get
```
**cURL (Bash):**
```bash
curl -X GET http://127.0.0.1:8000/api/health
```

### 2. Google Authentication Simulator
**PowerShell:**
```powershell
$body = @{ credential = "test-token" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/google" -Method Post -Body $body -ContentType "application/json"
```
**cURL:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/google \
     -H "Content-Type: application/json" \
     -d '{"credential": "test-token"}'
```

### 3. Scanning a Project Directory
**PowerShell:**
```powershell
$body = @{ path = "sample_projects"; ai_provider = "fallback" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/scan" -Method Post -Body $body -ContentType "application/json"
```
**cURL:**
```bash
curl -X POST http://127.0.0.1:8000/api/scan \
     -H "Content-Type: application/json" \
     -d '{"path": "sample_projects", "ai_provider": "fallback"}'
```

### 4. Fetching Scanning History
**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/history" -Method Get
```

---

## 🛠️ Running the LeakageLens Command-Line Interface (CLI)

You can run CLI audits directly using Python:
```bash
# Run audit on the sample projects folder (using fallback template recommendations)
python -m leakagelens.main audit sample_projects --ai fallback

# Output the audit report in JSON format
python -m leakagelens.main audit sample_projects --format json

# Output the audit report to a Markdown file
python -m leakagelens.main audit sample_projects --format markdown --output audit_report.md
```

---

## 🧪 Running Automated Unit Tests

Execute the test suites using `pytest`:
```bash
pytest
```
This runs the assertions located in the `/tests/` directory to verify core module imports and functionalities.
