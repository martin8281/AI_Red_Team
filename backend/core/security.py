"""
Authentication, JWT Token Verification, RBAC Dependencies, Rate Limiting, and Security Headers.
"""
import time
import json
import base64
import hmac
import hashlib
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from pydantic import BaseModel, Field
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.core.config import settings


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')


def _b64url_decode(s: str) -> bytes:
    rem = len(s) % 4
    if rem > 0:
        s += '=' * (4 - rem)
    return base64.urlsafe_b64decode(s.encode('utf-8'))


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Constant-time password hash verification.
    """
    if not plain_password or not hashed_password:
        return False
    computed_hash = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
    return hmac.compare_digest(computed_hash, hashed_password)


def hash_password(password: str) -> str:
    """
    Computes cryptographic SHA-256 hash.
    """
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
    secret_key: Optional[str] = None
) -> str:
    """
    Creates an RFC 7519 compliant HMAC-SHA256 JWT access token.
    """
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = _b64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    
    payload_dict = dict(data)
    if "exp" not in payload_dict:
        expire_seconds = expires_delta.total_seconds() if expires_delta else (settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
        payload_dict["exp"] = int(time.time() + expire_seconds)
    if "iat" not in payload_dict:
        payload_dict["iat"] = int(time.time())

    payload_b64 = _b64url_encode(json.dumps(payload_dict, separators=(',', ':')).encode('utf-8'))
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    key = (secret_key or settings.JWT_SECRET).encode('utf-8')
    signature = hmac.new(key, signing_input, hashlib.sha256).digest()
    signature_b64 = _b64url_encode(signature)

    return f"{header_b64}.{payload_b64}.{signature_b64}"


def decode_access_token(token: str, secret_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Decodes and cryptographically verifies an HMAC-SHA256 JWT access token.
    Raises ValueError on malformed format, bad signature, or token expiration.
    """
    if not token or not isinstance(token, str):
        raise ValueError("Token must be a non-empty string")
    
    parts = token.strip().split('.')
    if len(parts) != 3:
        raise ValueError("Malformed JWT token: expected exactly 3 dot-separated segments")
    
    header_b64, payload_b64, signature_b64 = parts
    signing_input = f"{header_b64}.{payload_b64}".encode('utf-8')
    key = (secret_key or settings.JWT_SECRET).encode('utf-8')
    expected_sig = hmac.new(key, signing_input, hashlib.sha256).digest()
    
    try:
        provided_sig = _b64url_decode(signature_b64)
    except Exception as e:
        raise ValueError(f"Invalid signature encoding: {str(e)}")
    
    if not hmac.compare_digest(expected_sig, provided_sig):
        raise ValueError("Invalid JWT signature: cryptographic verification failed")
    
    try:
        payload = json.loads(_b64url_decode(payload_b64).decode('utf-8'))
    except Exception as e:
        raise ValueError(f"Malformed JWT payload: {str(e)}")
    
    if "exp" in payload and time.time() > payload["exp"]:
        raise ValueError("JWT token has expired")
    
    return payload


class AuthenticatedUser(BaseModel):
    user_id: str
    email: str
    role: str = "SECURITY_TESTER"
    name: str = "Authorized Tester"
    authorized_projects: List[str] = Field(default_factory=list)


security_bearer = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)
) -> AuthenticatedUser:
    """
    FastAPI security dependency. Extracts Bearer token, validates signature/expiration,
    and returns the authenticated user object.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Authentication required. Missing Bearer token.")
    
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        return AuthenticatedUser(
            user_id=payload.get("sub", "usr-anonymous"),
            email=payload.get("email", "user@redteam.local"),
            role=payload.get("role", "SECURITY_TESTER"),
            name=payload.get("name", "Authorized Analyst"),
            authorized_projects=payload.get("authorized_projects", ["*"] if payload.get("role") == "ADMIN" else ["PRJ-101", "PRJ-102", "PRJ-GOLDEN-01"])
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


def require_roles(*allowed_roles: str):
    """
    FastAPI dependency factory enforcing Role-Based Access Control (RBAC).
    """
    def role_checker(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        if user.role != "ADMIN" and user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access forbidden. Role '{user.role}' is not authorized for this operation."
            )
        return user
    return role_checker


def verify_user_project_access(user: AuthenticatedUser, project_id: str) -> bool:
    """
    Enforces project-level IDOR boundary.
    """
    if user.role == "ADMIN" or "*" in user.authorized_projects:
        return True
    if project_id in user.authorized_projects:
        return True
    raise HTTPException(
        status_code=403,
        detail=f"Access denied. User '{user.user_id}' is not authorized to access project '{project_id}'."
    )


class RateLimiter:
    def __init__(self, max_requests: int = 120, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.client_requests: Dict[str, list] = {}

    def is_rate_limited(self, client_ip: str) -> bool:
        now = time.time()
        requests = self.client_requests.get(client_ip, [])
        # Expire old requests outside the window
        valid_requests = [t for t in requests if now - t < self.window_seconds]
        if len(valid_requests) >= self.max_requests:
            return True
        valid_requests.append(now)
        self.client_requests[client_ip] = valid_requests
        return False


# Security Headers Configuration
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:;",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
}
