import os
from pathlib import Path

# Load environment variables from backend/.env or root .env if present
def _load_env():
    candidates = [
        Path(__file__).parent / ".env",
        Path(__file__).parent.parent / ".env",
    ]
    for env_path in candidates:
        if env_path.exists():
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            os.environ.setdefault(k.strip(), v.strip().strip("\"'"))
            except Exception:
                pass

_load_env()

# =========================================================================
# 🔑 INBUILT GROK (xAI) API KEY CONFIGURATION
#
# You can paste your Grok API key directly below, or set GROK_API_KEY
# in backend/.env or as a system environment variable.
# =========================================================================
GROK_API_KEY: str = os.getenv("GROK_API_KEY") or os.getenv("XAI_API_KEY") or "PASTE_YOUR_GROK_API_KEY_HERE"

GROK_MODEL: str = os.getenv("GROK_MODEL", "grok-2-latest")
GROK_BASE_URL: str = os.getenv("GROK_BASE_URL", "https://api.x.ai/v1")
