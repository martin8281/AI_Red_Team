"""
Security Tests: File Upload Validation, Extension Allowlist, and Size Limits.
"""
from backend.core.sanitization import SecuritySanitizer

def test_file_upload_extension_allowlist():
    assert SecuritySanitizer.validate_file_upload("auth_audit.log", 1024)[0] is True
    assert SecuritySanitizer.validate_file_upload("scan.xml", 2048)[0] is True
    assert SecuritySanitizer.validate_file_upload("network.pcap", 50000)[0] is True

    valid, reason = SecuritySanitizer.validate_file_upload("malware.exe", 1024)
    assert valid is False
    assert "Unsupported file extension" in reason

def test_file_upload_size_limit():
    valid, reason = SecuritySanitizer.validate_file_upload("large.log", 51 * 1024 * 1024)
    assert valid is False
    assert "exceeds maximum" in reason

def test_file_upload_null_byte_injection():
    valid, reason = SecuritySanitizer.validate_file_upload("safe.txt\x00.exe", 100)
    assert valid is False
    assert "Null byte" in reason
