const PII_PATTERNS = [
  /\b[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, // email
  /\b\+?\d[\d\s().-]{7,}\b/g, // phone
  /\b\d{1,5}\s+[\w\s.]+\s(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b/gi, // address-like
];

export function sanitizeText(text: string) {
  return PII_PATTERNS.reduce((safe, pattern) => safe.replace(pattern, "[REDACTED]"), text)
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim();
}

export function safeJSONParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function clampScore(value: number, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}
