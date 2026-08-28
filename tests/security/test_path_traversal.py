"""
Security Tests: Path Traversal & Filename Sanitization.
"""
from backend.core.sanitization import SecuritySanitizer

PATH_TRAVERSAL_PAYLOADS = [
    "../../../../etc/passwd",
    "..\\..\\..\\windows\\system32\\cmd.exe",
    "....//....//etc/shadow",
    "/etc/hosts",
    "C:\\secret\\keys.pem",
    "finding_report_../../config.json",
]

def test_path_traversal_sanitizer_removes_traversal_sequences():
    for payload in PATH_TRAVERSAL_PAYLOADS:
        clean = SecuritySanitizer.sanitize_filename(payload)
        assert "../" not in clean
        assert "..\\" not in clean
        assert "/" not in clean
        assert "\\" not in clean
        assert ":" not in clean
