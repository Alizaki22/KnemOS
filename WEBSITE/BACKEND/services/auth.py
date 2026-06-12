# backend/services/auth.py
import secrets
import os
from pathlib import Path
from fastapi import Request, HTTPException, Security
from fastapi.security import APIKeyHeader

TOKEN_FILE = Path("./data/.auth_token")

_token = None

def init_auth():
    """Generate or load the local auth token."""
    global _token
    TOKEN_FILE.parent.mkdir(parents=True, exist_ok=True)
    if TOKEN_FILE.exists():
        _token = TOKEN_FILE.read_text().strip()
    else:
        _token = secrets.token_urlsafe(32)
        TOKEN_FILE.write_text(_token)
        # Try to restrict file permissions to the current user (Windows/Unix)
        try:
            os.chmod(TOKEN_FILE, 0o600)
        except Exception:
            pass
    print(f"[Auth] Local IPC Token initialized.")

api_key_header = APIKeyHeader(name="Authorization", auto_error=False)

async def verify_token(request: Request, auth_header: str = Security(api_key_header)):
    """Dependency to check the local token."""
    if not _token:
        # If init_auth wasn't called, fallback to open (for tests etc. if needed)
        return True
        
    # Check query param (for WebSockets or specific requests)
    token = request.query_params.get("token")
    if token == _token:
        return True
        
    # Check header
    if auth_header:
        # Standard Bearer format
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        else:
            token = auth_header
        if token == _token:
            return True
            
    # For local dev extension integration without token (if needed, we can whitelist specific origins or IPs)
    # Since the Chrome Extension is local and can't read the file, we can either use a fixed extension key 
    # or skip auth for /api/system/browser-tabs by not applying this dependency to that route.

    raise HTTPException(status_code=401, detail="Unauthorized local IPC connection")

def get_current_token():
    return _token
