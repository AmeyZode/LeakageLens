from fastapi.testclient import TestClient

from backend.main import MOCK_HISTORY, app


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "ai_configured" in data
    assert "ai_engine" in data


def test_scan_code_snippet_direct():
    snippet = """import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
X_train, X_test = train_test_split(X_scaled)
"""
    response = client.post(
        "/api/scan",
        json={"code": snippet, "filename": "snippet.py"}
    )
    assert response.status_code == 200
    body = response.json()
    assert "score" in body
    assert "issues" in body
    assert len(body["issues"]) >= 1


def test_auth_google_rejects_missing_credential():
    response = client.post("/api/auth/google", json={"credential": ""})

    assert response.status_code == 400


def test_auth_google_returns_mock_session():
    response = client.post("/api/auth/google", json={"credential": "mock"})

    assert response.status_code == 200
    body = response.json()
    assert body["token"]
    assert body["user"]["email"] == "user@example.com"


def test_scan_missing_path_returns_404():
    response = client.post("/api/scan", json={"path": "does-not-exist"})

    assert response.status_code == 404


def test_scan_sample_project_returns_compatible_payload():
    response = client.post(
        "/api/scan",
        json={"path": "sample_projects", "ai_provider": "fallback", "api_key": None},
    )

    assert response.status_code == 200
    body = response.json()
    assert set(["score", "counts", "issues"]).issubset(body)
    assert "files_scanned" in body
    assert "rule_errors" in body
    assert body["files_scanned"] >= 1
    assert isinstance(body["issues"], list)


def test_history_get_and_post():
    initial_count = len(MOCK_HISTORY)

    post_response = client.post(
        "/api/history",
        json={
            "project_name": "sample_projects",
            "score": 87,
            "critical_count": 0,
            "major_count": 1,
            "minor_count": 2,
        },
    )
    get_response = client.get("/api/history")

    assert post_response.status_code == 200
    assert get_response.status_code == 200
    assert len(get_response.json()) == initial_count + 1


def test_recommendation_endpoint_returns_fallback_guidance():
    response = client.post(
        "/api/recommendation",
        json={
            "rule_id": "R001",
            "rule_name": "Missing Random State",
            "severity": "major",
            "file_path": "pipeline.py",
            "line_number": 3,
            "context_line": "train_test_split(X, y)",
            "description": "Missing random_state",
            "ai_provider": "fallback",
            "api_key": None,
        },
    )

    assert response.status_code == 200
    assert "fix" in response.json()


def test_upload_file_and_scan_returns_compatible_payload():
    file_content = b"import pandas as pd\nX_scaled = scaler.fit_transform(X)\nX_train, X_test = train_test_split(X_scaled)\n"
    response = client.post(
        "/api/upload",
        files={"file": ("test_leaky_script.py", file_content, "text/x-python")},
        data={"ai_provider": "fallback"}
    )

    assert response.status_code == 200
    body = response.json()
    assert set(["score", "counts", "issues"]).issubset(body)
    assert body["files_scanned"] >= 1
    assert len(body["issues"]) >= 1

