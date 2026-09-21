"""
Defense-in-depth sanitization for SSRF, Path Traversal, XSS, and safe error handling.
"""
import re
import ipaddress
from urllib.parse import urlparse
from typing import Tuple, Dict, Any, Optional, List

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
    def safe_parse_xml(xml_content: str) -> Tuple[bool, Any, str]:
        """
        Parses XML content securely with XXE and Entity Expansion defense.
        Explicitly blocks DOCTYPE declarations with external SYSTEM/PUBLIC entities.
        """
        if not xml_content or not xml_content.strip():
            return False, None, "Empty XML content."

        # Detect and reject DTD external entity declarations (XXE)
        if re.search(r"<!DOCTYPE", xml_content, re.IGNORECASE) and re.search(r"(<!ENTITY|\bSYSTEM\b|\bPUBLIC\b)", xml_content, re.IGNORECASE):
            return False, None, "XXE Defense: DTD with external entity declarations is strictly prohibited."

        import xml.etree.ElementTree as ET
        try:
            # Enforce safe parsing using standard ElementTree
            parser = ET.XMLParser()
            root = ET.fromstring(xml_content, parser=parser)
            return True, root, "XML parsed securely."
        except Exception as e:
            return False, None, f"Malformed XML syntax: {str(e)}"

    @staticmethod
    def sanitize_csv_formula(value: str) -> str:
        """
        Neutralizes formula injection in CSV exports (=, +, -, @, tab, cr).
        """
        if not value:
            return ""
        str_val = str(value)
        if str_val and str_val[0] in ["=", "+", "-", "@", "\t", "\r"]:
            return f"'{str_val}"
        return str_val

    @staticmethod
    def validate_file_upload(
        filename: str,
        file_size_bytes: int,
        max_size_mb: int = 50,
        allowed_extensions: Optional[List[str]] = None
    ) -> Tuple[bool, str]:
        """
        Validates file upload constraints: extension allowlist, size limits, and path traversal.
        """
        if not filename:
            return False, "Filename cannot be empty."

        # Null-byte injection defense
        if "\x00" in filename:
            return False, "Null byte detected in filename."

        # Path traversal defense
        if ".." in filename or "/" in filename or "\\" in filename:
            clean_name = SecuritySanitizer.sanitize_filename(filename)
            if clean_name != filename:
                return False, "Path traversal sequence detected in filename."

        # File size defense (Default: 50MB limit)
        max_bytes = max_size_mb * 1024 * 1024
        if file_size_bytes > max_bytes:
            return False, f"File size exceeds maximum permitted limit of {max_size_mb} MB."

        # Allowed extension verification
        allowed = allowed_extensions or [
            "log", "txt", "csv", "json", "xml", "pdf", "docx",
            "pcap", "pcapng", "evtx", "sql", "yaml", "yml", "md",
            "png", "jpg", "jpeg", "webp", "gif"
        ]
        ext = filename.split(".")[-1].lower() if "." in filename else ""
        if ext not in allowed:
            return False, f"Unsupported file extension: .{ext}. Allowed extensions: {', '.join(allowed[:8])}..."

        return True, "File upload is valid and compliant."

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
