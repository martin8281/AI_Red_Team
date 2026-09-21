"""
Security Tests: Authentication, Password Hashing & Constant-Time Verification.
"""
from backend.core.security import hash_password, verify_password, RateLimiter

def test_password_hashing_and_verification():
    raw_pass = "P@ssw0rdSecure!2026"
    hashed = hash_password(raw_pass)
    assert hashed != raw_pass
    assert len(hashed) == 64
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False

def test_rate_limiter_throttling():
    limiter = RateLimiter(max_requests=5, window_seconds=60)
    client_ip = "198.51.100.99"

    for _ in range(5):
        assert limiter.is_rate_limited(client_ip) is False

    assert limiter.is_rate_limited(client_ip) is True
