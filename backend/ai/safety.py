import re
from typing import Optional

SENSITIVE_PATTERNS = [
    (r"bearer\s+[a-zA-Z0-9_\-\.]{20,}", "Bearer [REDACTED_TOKEN]"),
    (r"eyJ[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]{10,}", "[REDACTED_JWT_TOKEN]"),
    (r"(?:password|passwd|pwd|secret)\s*[:=]\s*[\"']?([^\"'\s&]+)[\"']?", "password=\"[REDACTED_SECRET]\""),
    (r"AKIA[0-9A-Z]{16}", "[REDACTED_AWS_KEY]"),
    (r"-----BEGIN (?:RSA )?PRIVATE KEY-----[^-]+-----END (?:RSA )?PRIVATE KEY-----", "[REDACTED_PRIVATE_KEY]"),
]

PROMPT_INJECTION_PATTERNS = [
    r"ignore\s+(?:all\s+)?(?:previous|prior)\s+instructions",
    r"disregard\s+(?:all\s+)?(?:previous|prior)\s+(?:rules|instructions|prompts)",
    r"you\s+are\s+now\s+(?:an?\s+)?(?:unfiltered|unrestricted|god\s+mode|dan)",
    r"system\s+override",
    r"reveal\s+(?:the\s+)?system\s+prompt",
    r"bypass\s+(?:all\s+)?safety\s+filters",
]

class SafetySanitizer:
    @staticmethod
    def redact_secrets(text: Optional[str]) -> str:
        if not text:
            return ""
        sanitized = text
        for pattern, replacement in SENSITIVE_PATTERNS:
            sanitized = re.sub(pattern, replacement, sanitized, flags=re.IGNORECASE)
        return sanitized

    @staticmethod
    def sanitize_untrusted_context(text: Optional[str]) -> str:
        if not text:
            return ""
        cleaned = SafetySanitizer.redact_secrets(text)
        for pattern in PROMPT_INJECTION_PATTERNS:
            cleaned = re.sub(pattern, "[FLAGGED_INJECTION_ATTEMPT]", cleaned, flags=re.IGNORECASE)
        return cleaned

    @staticmethod
    def wrap_untrusted_data(label: str, data: str) -> str:
        clean_data = SafetySanitizer.sanitize_untrusted_context(data)
        return f'<UNTRUSTED_CONTEXT_DATA label="{label}">\n{clean_data}\n</UNTRUSTED_CONTEXT_DATA>'
