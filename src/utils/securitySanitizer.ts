/**
 * Security Sanitization & Defensive Validation Utilities.
 * Enforces Zero-Trust validation across XSS, Path Traversal, SSRF, and SQL Injection.
 */

// 1. Cross-Site Scripting (XSS) Sanitizer
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// 2. Path Traversal & Filename Sanitizer
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed_artifact';
  // Strip directory traversals (../, ..\, absolute paths)
  let clean = filename.replace(/(\.\.[\/\\])+/g, '');
  // Remove special/illegal filesystem characters
  clean = clean.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
  // Avoid leading dots or dashes
  clean = clean.replace(/^[\.\-]+/, '');
  return clean || 'sanitized_file';
}

// 3. Server-Side Request Forgery (SSRF) URL Validator
export interface SSRFValidationResult {
  isValid: boolean;
  reason?: string;
}

export function validateSafeUrl(urlStr: string): SSRFValidationResult {
  if (!urlStr || typeof urlStr !== 'string') {
    return { isValid: false, reason: 'URL must be a non-empty string.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    return { isValid: false, reason: 'Invalid URL format.' };
  }

  // Only allow HTTP and HTTPS
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { isValid: false, reason: `Protocol ${parsed.protocol} is disallowed. Only http/https permitted.` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost & loopback
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname.startsWith('127.')
  ) {
    return { isValid: false, reason: 'Requests to loopback / localhost addresses are blocked.' };
  }

  // Block Cloud Instance Metadata (AWS / GCP / Azure 169.254.169.254)
  if (hostname === '169.254.169.254' || hostname.startsWith('169.254.')) {
    return { isValid: false, reason: 'Requests to cloud instance metadata services (169.254.169.254) are blocked.' };
  }

  // Block Private RFC1918 Subnets
  if (
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
  ) {
    return { isValid: false, reason: 'Requests to internal private RFC1918 networks are blocked.' };
  }

  return { isValid: true };
}

// 4. SQL Injection Heuristic Scanner (Defense-in-Depth)
export function containsSqlInjectionKeywords(input: string): boolean {
  if (!input) return false;
  const sqlPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /\b(UNION(\s+ALL)?|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC|EXECUTE)\b/i,
    /\b(OR|AND)\s+['"]?\w+['"]?\s*=\s*['"]?\w+['"]?/i,
  ];
  return sqlPatterns.some((pattern) => pattern.test(input));
}
