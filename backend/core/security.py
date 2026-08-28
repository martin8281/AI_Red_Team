"""
Authentication, Token Verification, Rate Limiting, and Security Headers Middleware.
"""
import time
import hmac
import hashlib
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

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
