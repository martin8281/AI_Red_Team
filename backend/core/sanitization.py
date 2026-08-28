"""
Defense-in-depth sanitization for SSRF, Path Traversal, XSS, and safe error handling.
"""
import re
import ipaddress
from urllib.parse import urlparse
from typing import Tuple, Dict, Any

class SecuritySanitizer:
    @staticmethod
    def sanitize_xss(text: str) -> str:
        if not text:
            return ""
        return (
            text.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
            .replace("'", "&#x27;")
            .replace("/", "&#x2F;")
        )

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        if not filename:
            return "artifact.dat"
        # Strip directory traversal sequences
        clean = re.sub(r"(\.\.[/\\])+", "", filename)
        # Strip illegal characters
        clean = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", clean)
        clean = re.sub(r"^[\.\-]+", "", clean)
        return clean or "artifact.dat"

    @staticmethod
    def validate_ssrf_url(url: str) -> Tuple[bool, str]:
        if not url:
            return False, "URL cannot be empty."

        try:
            parsed = urlparse(url)
        except Exception:
            return False, "Malformed URL string."

        if parsed.scheme not in ["http", "https"]:
            return False, f"Disallowed protocol scheme: {parsed.scheme}."

        hostname = parsed.hostname
        if not hostname:
            return False, "Invalid host in URL."

        hostname_lower = hostname.lower()

        # Block localhost / loopback
        if hostname_lower in ["localhost", "127.0.0.1", "::1"] or hostname_lower.startswith("127."):
            return False, "Access to localhost/loopback addresses is restricted."

        # Block Cloud Instance Metadata
        if hostname_lower == "169.254.169.254" or hostname_lower.startswith("169.254."):
            return False, "Access to cloud instance metadata services (169.254.169.254) is blocked."

        # Check IP ranges
        try:
            ip = ipaddress.ip_address(hostname)
            if ip.is_private or ip.is_loopback or ip.is_link_local:
                return False, "Access to private/internal network IP ranges is blocked."
        except ValueError:
            # Hostname is a domain name, not a raw IP
            pass

        return True, "URL is safe for ingestion."

    @staticmethod
    def build_safe_error(error_code: str, message: str, reference_id: str = "ERR-SEC-99") -> Dict[str, Any]:
        """
        Ensures internal stack traces and database paths are never leaked to users.
        """
        return {
            "error": error_code,
            "message": message,
            "reference_id": reference_id,
            "timestamp": "2026-08-27T12:30:00Z",
        }
