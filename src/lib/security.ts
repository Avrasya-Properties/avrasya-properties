/**
 * Security utilities for URL sanitization, input normalization, and JSON-LD XSS prevention.
 */

// Strip ASCII control characters (except newline \n, carriage return \r, and tab \t)
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const SAFE_PROTOCOLS = new Set(["https:", "http:", "mailto:", "tel:"]);

/**
 * Validates and returns a safe URL string for href attributes.
 * Allows single-slash relative paths (`/properties`), hash fragments (`#contact`),
 * and explicit `https:`, `http:`, `mailto:`, or `tel:` URLs.
 * Blocks `javascript:`, `data:`, `vbscript:`, control characters, and `//` open-redirect URLs.
 */
export function sanitizeSafeUrl(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;

  // Strip embedded control characters before checking scheme
  const cleaned = raw.replace(CONTROL_CHARS_RE, "").trim();
  if (!cleaned) return undefined;

  // Block protocol-relative URLs (//evil.com)
  if (cleaned.startsWith("//") || cleaned.startsWith("\\\\")) {
    return undefined;
  }

  // Allow safe internal paths and hash links
  if (cleaned.startsWith("/") || cleaned.startsWith("#")) {
    return cleaned;
  }

  try {
    const parsed = new URL(cleaned);
    if (SAFE_PROTOCOLS.has(parsed.protocol.toLowerCase())) {
      return cleaned;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

/**
 * Strips control characters, trims whitespace, and enforces a maximum character length
 * on user-supplied enquiry form fields before transmission.
 */
export function sanitizeEnquiryField(value: unknown, maxLength = 1000): string {
  if (typeof value !== "string") return "";
  return value.replace(CONTROL_CHARS_RE, "").trim().slice(0, maxLength);
}

/**
 * Serializes structured data for `<script type="application/ld+json">` and escapes
 * `<`, `>`, and `&` as Unicode sequences to prevent `</script>` breakout XSS.
 */
export function escapeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
