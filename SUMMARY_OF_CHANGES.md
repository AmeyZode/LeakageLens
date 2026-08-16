# Summary of Project Changes: LeakageLens

**Date:** August 16, 2026  
**Project:** LeakageLens (ML Code Static Analysis & Data Leakage Audit Tool)

---

## 1. Overview & High-Level Summary

LeakageLens was transformed from an incomplete prototype into a fully functional MVP static-analysis tool for machine learning pipelines. The system combines:
- A AST-based Python rule engine detecting data leakage (`L001-L003`), reproducibility issues (`R001-R004`), evaluation flaws (`E001-E002`), and code quality warnings (`Q001-Q003`).
- A FastAPI web server with REST endpoints for scanning, mock Google authentication, scan history, and AI recommendations.
- A React + Vite frontend single-page application with modular routing, scan management, dashboard metrics, recommendation engine UI, and PDF/JSON export support.
- A CLI tool built with Typer for terminal-based project audits.
- Full unit test coverage (`pytest`) covering rule logic, ingestion, API behavior, and health checks.

---

## 2. Core Analysis Engine & Rule Detectors (`leakagelens/`)

### Rule Engine Modernization
Replaced naive/filename-driven placeholder checks with AST (Abstract Syntax Tree) and structured code analysis:
- **`L001` (Preprocessing Before Split Leakage):** Detects calls to `fit_transform` or `fit` executed before dataset splitting functions (`train_test_split`).
- **`R001` (Unseeded Stochastic Functions):** Detects calls to stochastic functions (e.g., `train_test_split`, `RandomForestClassifier`, `KFold`) missing the `random_state` parameter.
- **`R002` (Missing Global Random Seed):** Detects stochastic library usage (`numpy`, `random`, `torch`) when no global seed initialization (`np.random.seed`, `random.seed`, `torch.manual_seed`) is present in the module context.
- **`R003` (Hardcoded Absolute Paths):** Identifies non-portable hardcoded absolute file system paths in string constants.
- **`E001` (Evaluation Data Contamination):** Flags model scoring (`.score()`), prediction (`.predict()`), or evaluation metrics called directly on training datasets.

### Core Pipeline (`leakagelens/core/`)
- **Ingestion & Normalization:** `leakagelens/core/normalization.py` handles parsing of standard `.py` source files and `.ipynb` Jupyter Notebooks into unified Code Block objects with line-mapping metadata.
- **Context Building:** `leakagelens/core/context_builder.py` extracts source context snippets surrounding detected issues for downstream LLM prompts.

---

## 3. Backend & API Services (`backend/`)

- **FastAPI Application (`backend/main.py`):**
  - `/api/health`: Provides service liveness checks.
  - `/api/auth/google`: Handles mock Google OAuth flow for development user sessions.
  - `/api/scan`: Accepts target directory paths, runs `backend/analyzer.py`, and returns health scores, issue counts categorized by severity (Critical, Major, Minor), scanned file counts, and AST error logs.
  - `/api/history`: Stores and retrieves prior scan reports.
  - `/api/recommendation`: Integrates with AI providers to generate context-aware remediation code snippets.
- **Analyzer Adapter (`backend/analyzer.py`):** Wraps `leakagelens.main` pipeline execution, adds error handling, logs individual rule failures gracefully without crashing scans, and computes composite health scores (0-100 scale).

---

## 4. AI Recommendation Engine (`leakagelens/ai/`)

- **`leakagelens/ai/recommendation_engine.py`:** Implemented dual-mode recommendation generation:
  - **Fallback Mode:** Standalone template-driven fix suggestions with zero external API dependencies.
  - **OpenAI Mode:** Formats system & user prompts using `prompt_templates.py` and calls OpenAI's Chat Completion API when provided an API key.
- **Context Builder Fix:** Fixed a CLI issue context bug in `leakagelens/main.py` where recommendations were reusing context from the wrong normalized file instead of the file containing the issue.

---

## 5. CLI Tooling (`leakagelens/main.py`)

- Updated Typer CLI commands to support full directory scanning (`leakagelens audit <path>`).
- Terminal formatted outputs featuring colored severity badges and fix suggestions.

---

## 6. Frontend Application (`frontend/`)

- **Architecture & Cleanup:**
  - Standardized modern React structure using Vite.
  - Removed deprecated legacy view components (`Profile.jsx`, `Dashboard.jsx`, `Login.jsx`, `Home.jsx`, `Layout.jsx`, `Sidebar.jsx`, `MetricCard.jsx`, `IssueAccordion.jsx`).
- **Feature Set:**
  - **Scan Workspace:** Dynamic form to specify scan directory, select AI provider (`fallback` vs `openai`), and input API keys.
  - **Dashboard & Metrics:** Visual breakdown of score gauge, issue distribution, and critical warnings.
  - **Rule Catalog & Reports:** View detailed issue details, line numbers, snippet context, and export options (JSON / Markdown / HTML).
  - **Settings & History:** Configure theme preferences and inspect past audit runs.

---

## 7. Testing & Quality Assurance (`tests/`)

- **API Test Suite (`tests/test_api.py`):**
  - Verifies HTTP status codes and response schemas for `/api/health`, `/api/auth/google`, `/api/scan`, `/api/history`, and `/api/recommendation`.
- **Rule Engine Test Suite (`tests/test_rules.py`):**
  - Tests positive detection on leaky code blocks and verifies zero false positives on compliant code.
- **Pipeline & Ingestion Tests:** Validates Jupyter notebook parsing and AST code context generation.

---

## 8. Repository Hygiene & Packaging

- **`.gitignore` Optimization:** Excluded heavy runtime and build artifacts (`node_modules`, `dist`, `__pycache__`, `.pytest_cache`, `.egg-info`, `.venv`, `.env`).
- **`pyproject.toml` Configuration:**
  - Standardized packaging setup using setuptools.
  - Restricted package discovery to `leakagelens*` to prevent treating `frontend`, `backend`, or `sample_projects` as Python packages.
  - Declared runtime dependencies (`fastapi`, `uvicorn`, `typer`, `pydantic`, `rich`) and dev extras (`pytest`, `httpx`).
- **`requirements.txt` Synchronized:** Mirroring `pyproject.toml` dependencies for quick standard pip installations.

---

## 9. Documentation

- **`README.md`:** Overview, installation instructions, quickstart for CLI & Web server.
- **`CONTEXT_SUMMARY.md`:** Comprehensive architectural state of the repository.
- **`testing_guide.md`:** Instructions for executing `pytest` and frontend verification.
- **`further_integration.md`:** Guidelines for extending rule sets and adding additional AI backends.

---

## 10. Summary of Key Files Changed / Created

| Path | Action | Description |
|---|---|---|
| `SUMMARY_OF_CHANGES.md` | **[NEW]** | Documented overall project changes |
| `backend/analyzer.py` | **[MODIFY]** | Added error logging, score computation, and structured scan meta |
| `backend/main.py` | **[MODIFY]** | FastAPI application setup with scan, auth, history & recommendation routes |
| `leakagelens/core/normalization.py` | **[MODIFY]** | Jupyter notebook and Python AST normalization |
| `leakagelens/rules/*.py` | **[MODIFY]** | Implemented AST detectors for `L001`, `R001`, `R002`, `R003`, `E001` |
| `leakagelens/ai/recommendation_engine.py` | **[MODIFY]** | Implemented fallback & OpenAI remediation generator |
| `leakagelens/main.py` | **[MODIFY]** | CLI Typer interface & context bug fix |
| `pyproject.toml` | **[MODIFY]** | Package metadata, entry points, & explicit package discovery |
| `requirements.txt` | **[MODIFY]** | Added backend & test dependencies |
| `.gitignore` | **[MODIFY]** | Cleaned up untracked pycache, node_modules, & build outputs |
| `tests/test_api.py` | **[NEW]** | Comprehensive API endpoint tests |
| `tests/test_rules.py` | **[MODIFY]** | Expanded rule positive/negative assertion tests |
| `frontend/src/*` | **[CLEANUP]** | Removed legacy dead code views/components and standardized Vite SPA |

---

## 11. Verification Results

- **Backend Unit Tests:** `pytest` passed (22/22 tests passing).
- **Frontend Build:** `npm run build` executed successfully without compilation errors.
- **FastAPI Endpoints:** Smoke tested `/api/health` and `/api/scan` returning HTTP 200.
