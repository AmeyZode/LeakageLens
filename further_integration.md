# Frontend Integration Guide - LeakageLens

This document details how the React frontend application (located in `/frontend/`) integrates with the FastAPI backend service (`/backend/`).

---

## 🛠️ API Connection Configuration

The Vite dev server is configured to proxy requests. You should configure your API client (e.g., using `axios` or native `fetch`) to point to the FastAPI server:
- **Development Base URL:** `http://127.0.0.1:8000` (or proxy via `/api` in Vite configurations)
- **Production Base URL:** Configure via an environment variable `VITE_API_URL`

---

## 🔑 Endpoint Integrations

### 1. Google Authentication
- **View:** `Login.jsx` (Gmail validation and loading spinner)
- **Action:** Triggers when the user successfully signs in using the Google Sign-In button.
- **Request:**
  ```http
  POST /api/auth/google
  Content-Type: application/json
  
  {
    "credential": "google-oauth-credential-token-string"
  }
  ```
- **Response:**
  ```json
  {
    "token": "mock-jwt-session-token-12345",
    "user": {
      "email": "user@example.com",
      "name": "Yedhu",
      "avatar": "https://lh3.googleusercontent.com/a/default-user"
    }
  }
  ```
- **Integration Note:** Save the returned `token` and `user` object in the React State or Context and persist it in `localStorage` for session maintenance.

---

### 2. User Profiles & API Keys
- **View:** `Profile.jsx` (Custom OpenAI API keys configuration)
- **Action:** Users input their custom OpenAI API Key.
- **Integration Note:** Rather than storing sensitive API keys on the server database, the frontend should store the `api_key` securely in local storage (encrypted if possible) and send it as a header or request body parameter (`api_key`) during scan executions.

---

### 3. Scanning ML Pipelines
- **View:** `Dashboard.jsx` (Scan trigger buttons, radial charts, and issue lists)
- **Action:** Triggered when the user enters a directory path (or clicks "Scan Current Directory") and submits.
- **Request:**
  ```http
  POST /api/scan
  Content-Type: application/json
  
  {
    "path": "sample_projects",
    "ai_provider": "fallback", 
    "api_key": "optional-custom-openai-api-key"
  }
  ```
- **Response:**
  ```json
  {
    "score": 45,
    "counts": {
      "critical": 1,
      "major": 3,
      "minor": 1
    },
    "issues": [
      {
        "rule_id": "L001",
        "rule_name": "Preprocessing Leakage",
        "severity": "critical",
        "file_path": "preprocessing_leakage.py",
        "line_number": 13,
        "context_line": "X_scaled = scaler.fit_transform(X)",
        "description": "StandardScaler.fit_transform() is executed on target variable X prior to train_test_split. This causes future test distribution parameters to leak into training data.",
        "suggested_fix": "scaler = StandardScaler()\nX_train = scaler.fit_transform(X_train)\nX_test = scaler.transform(X_test)",
        "ai_recommendation": {
          "explanation": "Scaling or data transformation is executed on the entire dataset prior to splitting...",
          "fix": "# Perform train/test split first..."
        }
      }
      // ... other issues
    ]
  }
  ```
- **UI Render Instructions:**
  - **Radial Health Chart:** Map the returned `score` (0-100) directly to the dashboard's circular indicator.
  - **Issue Cards:** Render each item in the `issues` list inside `IssueAccordion.jsx`, grouping them by severity class (`critical`, `major`, `minor`).

---

### 4. Fetching Profile Audit History
- **View:** `Dashboard.jsx` (Audits history panel)
- **Action:** Fetch history logs when mounting the component.
- **Request:** `GET /api/history`
- **Response:**
  ```json
  [
    {
      "id": 1,
      "date": "2026-07-26T16:30:00",
      "project_name": "preprocessing_leakage.py",
      "score": 45,
      "critical_count": 1,
      "major_count": 3,
      "minor_count": 1
    }
  ]
  ```

- **Action:** Save a new audit log to history after a successful scan.
- **Request:**
  ```http
  POST /api/history
  Content-Type: application/json
  
  {
    "project_name": "preprocessing_leakage.py",
    "score": 45,
    "critical_count": 1,
    "major_count": 3,
    "minor_count": 1
  }
  ```

---

### 5. Fetching Specific AI Recommendations
- **View:** `Dashboard.jsx` (Suggested fix modal / expand detail view)
- **Request:**
  ```http
  POST /api/recommendation
  Content-Type: application/json
  
  {
    "rule_id": "L001",
    "rule_name": "Preprocessing Leakage",
    "severity": "critical",
    "file_path": "preprocessing_leakage.py",
    "line_number": 13,
    "context_line": "X_scaled = scaler.fit_transform(X)",
    "description": "...",
    "ai_provider": "fallback",
    "api_key": null
  }
  ```
- **Response:**
  ```json
  {
    "explanation": "Detailed explanation of why scaling before split is bad...",
    "fix": "# Correct implementation code..."
  }
  ```
