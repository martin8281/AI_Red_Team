"""
Security Tests: Cross-Site Scripting (XSS) Sanitization.
"""
from backend.core.sanitization import SecuritySanitizer

XSS_PAYLOADS = [
    "<script>alert(1)</script>",
    "<img src=x onerror=alert('XSS')>",
    "<svg/onload=alert('document.cookie')>",
    "<iframe src='javascript:alert(1)'></iframe>",
    "\"><script>alert(1)</script>",
]

def test_xss_sanitizer_escapes_harmful_characters():
    for payload in XSS_PAYLOADS:
        sanitized = SecuritySanitizer.sanitize_xss(payload)
        assert "<script>" not in sanitized
        assert "<img" not in sanitized
        assert "<svg" not in sanitized
        assert "<iframe" not in sanitized
        assert "&lt;" in sanitized or "&#x27;" in sanitized or "&#x2F;" in sanitized
