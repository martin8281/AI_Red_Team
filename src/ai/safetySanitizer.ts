/**
 * Safety and Data Sanitizer for AI Red Team Assistant.
 * Handles secret redaction and prompt injection neutralization.
 */

const SENSITIVE_PATTERNS = [
  // Bearer & JWT tokens
  /bearer\s+[a-zA-Z0-9_\-\.]{20,}/gi,
  /eyJ[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]{10,}/gi,
  // Passwords in query/body
  /(?:password|passwd|pwd|secret)\s*[:=]\s*["']?([^"'\s&]+)["']?/gi,
  // AWS Access Key ID & Secret Key
  /AKIA[0-9A-Z]{16}/g,
  /(?:aws_secret_access_key|aws_session_token)\s*[:=]\s*["']?([^"'\s&]+)["']?/gi,
  // Private Key Headers
  /-----BEGIN (?:RSA )?PRIVATE KEY-----[^-]+-----END (?:RSA )?PRIVATE KEY-----/gi,
  // Generic API Keys
  /(?:api[_-]?key|apikey|auth[_-]?token)\s*[:=]\s*["']?([a-zA-Z0-9_\-]{16,})["']?/gi,
];

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(?:all\s+)?(?:previous|prior)\s+instructions/gi,
  /disregard\s+(?:all\s+)?(?:previous|prior)\s+(?:rules|instructions|prompts)/gi,
  /you\s+are\s+now\s+(?:an?\s+)?(?:unfiltered|unrestricted|god\s+mode|dan)/gi,
  /system\s+override/gi,
  /reveal\s+(?:the\s+)?system\s+prompt/gi,
  /bypass\s+(?:all\s+)?safety\s+filters/gi,
];

export class SafetySanitizer {
  /**
   * Redacts sensitive secrets from user input or context string.
   */
  static redactSecrets(input: string): string {
    if (!input) return '';
    let sanitized = input;

    // Redact specific matches
    sanitized = sanitized.replace(
      /bearer\s+[a-zA-Z0-9_\-\.]{20,}/gi,
      'Bearer [REDACTED_TOKEN]'
    );
    sanitized = sanitized.replace(
      /eyJ[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]{10,}/gi,
      '[REDACTED_JWT_TOKEN]'
    );
    sanitized = sanitized.replace(
      /(password|passwd|pwd|secret)\s*([:=])\s*["']?([^"'\s&]+)["']?/gi,
      '$1$2"[REDACTED_SECRET]"'
    );
    sanitized = sanitized.replace(/AKIA[0-9A-Z]{16}/g, '[REDACTED_AWS_KEY]');
    sanitized = sanitized.replace(
      /-----BEGIN (?:RSA )?PRIVATE KEY-----[^-]+-----END (?:RSA )?PRIVATE KEY-----/gi,
      '[REDACTED_PRIVATE_KEY]'
    );

    return sanitized;
  }

  /**
   * Neutralizes prompt injection patterns in untrusted project context.
   */
  static sanitizeUntrustedContext(input: string): string {
    if (!input) return '';
    let text = this.redactSecrets(input);

    for (const pattern of PROMPT_INJECTION_PATTERNS) {
      text = text.replace(pattern, '[FLAGGED_INJECTION_ATTEMPT]');
    }

    return text;
  }

  /**
   * Formats untrusted content inside strict data boundary delimiters.
   */
  static wrapUntrustedData(label: string, data: string): string {
    const cleanData = this.sanitizeUntrustedContext(data);
    return `<UNTRUSTED_CONTEXT_DATA label="${label}">\n${cleanData}\n</UNTRUSTED_CONTEXT_DATA>`;
  }
}
