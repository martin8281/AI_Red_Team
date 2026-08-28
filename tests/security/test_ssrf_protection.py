"""
Security Tests: Server-Side Request Forgery (SSRF) Blocklist & Cloud Metadata Validation.
"""
from backend.core.sanitization import SecuritySanitizer

SSRF_DISALLOWED_URLS = [
    "http://127.0.0.1:8080/admin",
    "http://localhost:5432",
    "http://169.254.169.254/latest/meta-data/",
    "http://169.254.169.254/latest/api/token",
    "http://10.0.0.1/internal",
    "http://192.168.1.1/router",
    "http://172.16.0.10/database",
    "file:///etc/passwd",
    "ftp://internal.vault/keys",
    "gopher://127.0.0.1:6379/_flushall",
]

def test_ssrf_validation_blocks_internal_and_cloud_metadata():
    for url in SSRF_DISALLOWED_URLS:
        valid, reason = SecuritySanitizer.validate_ssrf_url(url)
        assert valid is False, f"URL should have been blocked: {url}"

def test_ssrf_validation_allows_safe_external_urls():
    safe_urls = [
        "https://owasp.org/Top10/",
        "https://cwe.mitre.org/data/definitions/89.html",
        "https://csrc.nist.gov/publications/detail/sp/800-115/final",
    ]
    for url in safe_urls:
        valid, reason = SecuritySanitizer.validate_ssrf_url(url)
        assert valid is True, f"URL should be allowed: {url}"
