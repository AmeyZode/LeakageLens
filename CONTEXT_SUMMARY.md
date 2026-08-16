# LeakageLens Context Summary

Updated: 2026-08-10

## Project

LeakageLens is a machine-learning code static-analysis MVP. It combines a Python rule engine and FastAPI backend with a React/Vite frontend. The application scans a local, path-based project, reports potential data leakage and reproducibility issues, calculates a score, and can provide fallback or OpenAI-backed recommendations.

Real Google OAuth, persistent database storage, project uploads, Ollama support, and production deployment remain outside the current MVP scope.

## Starting Context

The repository had a backend/core/CLI implementation on `main` through commit `6e644a7`, plus a frontend architecture commit `4afe096` on branch `pranav-frontendmodifications`. The frontend included separate pages, providers, route configuration, API services, scan state, settings, reports, history, recommendations, and a rule catalog.

The initial assessment estimated the project at roughly 55-60% complete overall:

- Backend/API: about 65%
- Frontend integration: about 60%
- Rule quality: about 35%
- Tests, packaging, and repository hygiene: about 25%

The main blockers were missing Python test dependencies, platform-specific frontend dependencies, generated files tracked by Git, filename-driven detector behavior, silent rule failures, and a CLI context bug.

## Implemented Changes

### Repository hygiene

`.gitignore` now excludes Python caches and bytecode, pytest cache, virtual environments, egg-info, frontend dependencies/build output, Vite cache, and local environment files.

Generated and dependency artifacts were removed from Git tracking without removing the source dependency installation from the working machine:

- `frontend/node_modules`
- `frontend/dist`
- `leakagelens.egg-info`
- Python `__pycache__` directories and `*.pyc` files
- Test cache artifacts

These appear as staged deletions because they were previously tracked. They should remain deleted in the eventual commit.

### Backend and analyzer

`backend/analyzer.py` now logs rule failures and returns additive metadata:

```json
{
  "score": 0,
  "counts": {"critical": 0, "major": 0, "minor": 0},
  "issues": [],
  "files_scanned": 0,
  "rule_errors": []
}
```

The original scan fields remain the canonical compatibility contract. `files_scanned` and `rule_errors` are optional additions.

The CLI recommendation flow in `leakagelens/main.py` now builds context from the source file associated with each individual issue instead of accidentally reusing the last normalized file.

### Rule quality

The following filename-driven sample detections were replaced with AST/content-based checks:

- `L001`: detects `fit_transform` used before `train_test_split`.
- `R001`: detects stochastic calls without a `random_state` argument.
- `R002`: detects stochastic usage when no global seed is present.
- `R003`: detects hardcoded absolute paths in string constants.
- `E001`: detects scoring, prediction, or metrics called with training-data-like arguments.

The existing placeholder rules remain placeholders and should stay clearly marked in both backend and frontend rule catalogs until implemented.

### Packaging and dependencies

`pyproject.toml` now declares the FastAPI runtime dependencies, `httpx` for development/API tests, and explicit setuptools package discovery limited to `leakagelens*`. This avoids accidentally treating `backend`, `frontend`, or sample projects as Python packages.

`requirements.txt` now includes `fastapi`, `uvicorn`, and `httpx`.

### Tests

`tests/test_rules.py` now tests positive detections and clean-code non-detections for `L001`, `R001`, `R002`, `R003`, and `E001`.

`tests/test_api.py` covers:

- Health endpoint
- Auth endpoint with missing and valid mock credentials
- Missing scan path
- Valid sample scan response shape
- History GET and POST
- Recommendation endpoint

### Frontend cleanup

After checking active imports, unused legacy files were removed:

- `frontend/src/views/Profile.jsx`
- `frontend/src/views/Dashboard.jsx`
- `frontend/src/views/Login.jsx`
- `frontend/src/views/Home.jsx`
- `frontend/src/components/Layout.jsx`
- `frontend/src/components/MetricCard.jsx`
- `frontend/src/components/Sidebar.jsx`
- `frontend/src/components/IssueAccordion.jsx`

The newer frontend architecture remains the active implementation.

## API Contract

The scan request remains path-based:

```json
{
  "path": "sample_projects",
  "ai_provider": "fallback",
  "api_key": null
}
```

The minimum response remains:

```json
{
  "score": 0,
  "counts": {
    "critical": 0,
    "major": 0,
    "minor": 0
  },
  "issues": []
}
```

The current API surface includes:

- `/api/health`
- `/api/auth/google`
- `/api/scan`
- `/api/history`
- `/api/recommendation`

The frontend should only send `api_key` when the selected provider is `openai`. Ollama should remain visibly unsupported until a backend implementation exists.

## Verification Completed

Python dependencies were installed with:

```bash
python3 -m pip install -e '.[dev]'
```

Frontend dependencies were reinstalled with:

```bash
cd frontend
npm ci
```

Results:

- `python3 -m pytest`: 22 tests passed.
- `npm run build`: passed.
- FastAPI health smoke test: passed.
- Frontend root request on port `3000`: returned HTTP 200.

Known non-blocking warnings:

- FastAPI/Starlette test client deprecation warning related to `httpx`.
- `datetime.datetime.utcnow()` deprecation warnings in `backend/main.py`.
- Vite reports a JavaScript bundle larger than 500 kB.
- `npm ci` reports 4 audit vulnerabilities: 1 moderate and 3 high. These should be reviewed separately with `npm audit` before production use.

## Runtime State

The backend and frontend were started for a smoke test and then stopped at the user's request.

- Frontend: `http://127.0.0.1:3000/`
- Backend: `http://127.0.0.1:8000/`
- Both ports were checked afterward and are clear.

## Current Worktree Notes

The worktree is intentionally dirty. It contains:

- Modified source files for the analyzer, rules, packaging, dependencies, and ignore rules.
- A new `tests/test_api.py` file.
- Updated `tests/test_rules.py`.
- Deleted legacy frontend files.
- Staged deletions for generated/dependency artifacts that were previously tracked.

No commit was created, and no unrelated user changes were reverted.

## Remaining Work

The next useful steps for the MVP are:

1. Make dashboard, scanner, reports, history, and recommendations use consistent empty, loading, and error states.
2. Add or document `files_scanned` usage in the frontend if needed.
3. Add frontend tests for scan normalization, report generation, severity sorting, and settings behavior.
4. Manually verify the complete browser workflow: mock login, scan `sample_projects`, dashboard metrics, issue details, recommendations, history, and Markdown/JSON exports.
5. Replace `utcnow()` with timezone-aware timestamps.
6. Review the frontend audit vulnerabilities and consider reducing the Vite bundle size.
7. Add clean and intentionally leaky sample fixtures for broader detector regression coverage.

