from fastapi import FastAPI, HTTPException, status, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from pathlib import Path
import datetime
import os
import shutil
import tempfile

try:
    from dotenv import load_dotenv
    workspace_root = Path(__file__).parent.parent.resolve()
    backend_dir = Path(__file__).parent.resolve()
    for env_file in [backend_dir / ".env", workspace_root / ".env", Path.cwd() / ".env"]:
        if env_file.exists():
            load_dotenv(env_file, override=False)
    load_dotenv()
except ImportError:
    pass

from backend.analyzer import PipelineAnalyzer
from leakagelens.rules.base_rule import Issue
from leakagelens.ai.recommendation_engine import RecommendationEngine

app = FastAPI(
    title="LeakageLens Backend API",
    description="FastAPI service exposing static analysis and AI audit recommendations.",
    version="0.1.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory database simulator
MOCK_USER = {
    "email": "user@example.com",
    "name": "Yedhu",
    "avatar": "https://lh3.googleusercontent.com/a/default-user"
}

MOCK_HISTORY = [
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

# Request Models
class AuthGoogleRequest(BaseModel):
    credential: str  # Represents Google OAuth token string

class ScanRequest(BaseModel):
    path: Optional[str] = "."
    ai_provider: str = "groq"
    api_key: Optional[str] = None
    code: Optional[str] = None
    filename: Optional[str] = "script.py"

class HistoryLogRequest(BaseModel):
    project_name: str
    score: int
    critical_count: int
    major_count: int
    minor_count: int

class RecommendationRequest(BaseModel):
    rule_id: str
    rule_name: str
    severity: str
    file_path: str
    line_number: int
    context_line: str
    description: str
    ai_provider: str = "groq"
    api_key: Optional[str] = None

# Root endpoint / Health Check
@app.get("/api/health")
def health_check():
    groq_key = os.getenv("GROQ_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    ai_configured = bool(groq_key or openai_key)
    ai_engine = "⚡ Groq (GPT-OSS 120B / Llama 3.3)" if groq_key else ("OpenAI (GPT-4o)" if openai_key else "Deterministic AST Rule Engine")
    return {
        "status": "ok", 
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "ai_configured": ai_configured,
        "ai_engine": ai_engine,
        "provider": "groq" if groq_key else ("openai" if openai_key else "fallback")
    }

# 1. Google OAuth Token Verification
@app.post("/api/auth/google")
def auth_google(req: AuthGoogleRequest):
    if not req.credential:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Credential token missing"
        )
    # Simulated oauth validation success
    return {
        "token": "mock-jwt-session-token-12345",
        "user": MOCK_USER
    }

# 2. Scanning Project Directory AST structures or Raw Code Snippet
UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

@app.post("/api/scan")
def scan_project(req: ScanRequest):
    # If raw code is sent directly from the frontend editor
    if req.code is not None:
        filename = req.filename or "script.py"
        safe_name = Path(filename).name or "script.py"
        snippet_dir = UPLOAD_DIR / "snippets"
        snippet_dir.mkdir(exist_ok=True)
        snippet_path = snippet_dir / safe_name
        with open(snippet_path, "w", encoding="utf-8") as f:
            f.write(req.code)

        try:
            analyzer = PipelineAnalyzer(ai_provider=req.ai_provider, api_key=req.api_key)
            results = analyzer.scan_path(str(snippet_path.resolve()))
            return results
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Snippet scan failed: {str(e)}"
            )

    # Resolve the path relative to the workspace root directory (which is parent of backend folder)
    workspace_root = Path(__file__).parent.parent.resolve()
    path_val = req.path or "."
    
    if path_val.startswith("upload://"):
        clean_name = path_val.replace("upload://", "").strip()
        uploaded_target = UPLOAD_DIR / clean_name
        if uploaded_target.exists():
            target_path = uploaded_target.resolve()
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Uploaded file '{clean_name}' no longer exists in uploads folder."
            )
    elif path_val == "." or not path_val:
        target_path = workspace_root
    else:
        # Check if absolute path or relative to workspace root
        test_path = Path(path_val)
        if test_path.is_absolute():
            target_path = test_path
        else:
            target_path = workspace_root / path_val
            
    target_path = target_path.resolve()
    
    if not target_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Path '{path_val}' does not exist on the file system."
        )
        
    try:
        analyzer = PipelineAnalyzer(ai_provider=req.ai_provider, api_key=req.api_key)
        results = analyzer.scan_path(str(target_path))
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scan failed: {str(e)}"
        )

# 2b. Upload Local File / ZIP Archive and Scan
@app.post("/api/upload")
@app.post("/api/scan-file")
@app.post("/api/scan-zip")
def upload_file_and_scan(
    file: UploadFile = File(...),
    ai_provider: str = Form("groq"),
    api_key: Optional[str] = Form(None)
):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in upload."
        )

    ext = Path(file.filename).suffix.lower()
    allowed_exts = [".py", ".ipynb", ".zip"]
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Allowed extensions: .py, .ipynb, .zip"
        )

    temp_save_path = UPLOAD_DIR / file.filename
    try:
        with open(temp_save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        target_scan_path = temp_save_path
        if ext == ".zip":
            extract_dir = UPLOAD_DIR / f"extracted_{Path(file.filename).stem}"
            extract_dir.mkdir(exist_ok=True)
            shutil.unpack_archive(temp_save_path, extract_dir)
            target_scan_path = extract_dir

        analyzer = PipelineAnalyzer(ai_provider=ai_provider, api_key=api_key)
        results = analyzer.scan_path(str(target_scan_path.resolve()))
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload scan failed: {str(e)}"
        )

# 3. User scanning history logs (GET & POST)
@app.get("/api/history")
def get_history():
    return MOCK_HISTORY

@app.post("/api/history")
def log_history(req: HistoryLogRequest):
    new_id = len(MOCK_HISTORY) + 1
    record = {
        "id": new_id,
        "date": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "project_name": req.project_name,
        "score": req.score,
        "critical_count": req.critical_count,
        "major_count": req.major_count,
        "minor_count": req.minor_count
    }
    MOCK_HISTORY.append(record)
    return {"success": True, "record": record}

# 4. Detailed Recommendation Engine Queries (Uses GROQ_API_KEY from backend .env)
@app.post("/api/recommendation")
def get_recommendation(req: RecommendationRequest):
    try:
        # Reconstruct base Pydantic Issue model
        issue = Issue(
            rule_id=req.rule_id,
            rule_name=req.rule_name,
            severity=req.severity,
            file_path=req.file_path,
            line_number=req.line_number,
            context_line=req.context_line,
            description=req.description
        )
        
        # Instantiate engine and return suggestion (automatically reads GROQ_API_KEY / OPENAI_API_KEY from .env)
        engine = RecommendationEngine(provider=req.ai_provider, api_key=req.api_key)
        rec = engine.get_recommendation(issue, req.context_line)
        return rec
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Recommendation query failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
