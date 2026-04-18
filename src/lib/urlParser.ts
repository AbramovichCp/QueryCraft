import type { ParsedUrl, QueryParam, ParamType } from '@/types';
import { detectParamType } from './paramTypes';

/**
 * Generate a unique ID for a parameter. Using crypto.randomUUID when available
 * (all modern Chrome), falling back to a timestamp + random for robustness in tests.
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `p_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/**
 * Normalize a decoded param value: structured (JSON object/array) values are
 * compacted via JSON.parse → JSON.stringify to strip any whitespace that was
 * baked in by pretty-printing (e.g. %0A%09 newline/tab sequences). This keeps
 * p.value consistent and prevents literal whitespace from leaking into the URL.
 */
function normalizeValue(raw: string): string {
  const t = raw.trim();
  if (t[0] === '{' || t[0] === '[') {
    try {
      const parsed: unknown = JSON.parse(t);
      if (typeof parsed === 'object' && parsed !== null) {
        return JSON.stringify(parsed);
      }
    } catch {
      // not valid JSON — return as-is
    }
  }
  return raw;
}

/**
 * Parse a URL string into its editable shape. Unlike `URLSearchParams`, we preserve
 * parameter order (which matters for some APIs) and keep structured keys like
 * `filters[category]` as opaque strings rather than trying to nest them.
 *
 * Throws if the URL is fundamentally invalid (bad origin/protocol).
 */
export function parseUrl(rawUrl: string): ParsedUrl {
  const url = new URL(rawUrl); // throws TypeError on invalid input

  const base = `${url.origin}${url.pathname}`;
  const params: QueryParam[] = [];

  // Hash-router pattern: query params live inside the hash fragment.
  // e.g. https://app.com/#/route?foo=bar  →  hash = "#/route?foo=bar"
  if (url.hash && url.hash.includes('?')) {
    const qIdx = url.hash.indexOf('?');
    const hashPath = url.hash.slice(0, qIdx); // e.g. "#/route"
    const hashSearch = url.hash.slice(qIdx + 1); // e.g. "foo=bar&baz=qux"

    for (const [key, value] of new URLSearchParams(hashSearch).entries()) {
      params.push({
        id: generateId(),
        key,
        value: normalizeValue(value),
        type: detectParamType(value),
      });
    }

    return { base, params, fragment: hashPath, hashQuery: true };
  }

  // Regular query params.
  for (const [key, value] of url.searchParams.entries()) {
    params.push({
      id: generateId(),
      key,
      value: normalizeValue(value),
      type: detectParamType(value),
    });
  }

  return { base, params, fragment: url.hash, hashQuery: false };
}

/**
 * Encode a query key or value for display.
 *
 * Only the five characters that are structurally significant inside a query
 * string need to be percent-encoded:
 *   &  →  %26  (param separator)
 *   =  →  %3D  (key/value separator)
 *   +  →  %2B  (space alias in form encoding)
 *   #  →  %23  (fragment delimiter)
 *   %  →  %25  (escape prefix)
 *
 * Everything else — Latin, Cyrillic, Chinese, emoji, punctuation — is left
 * as its original Unicode character so the URL is human-readable.
 * The previous approach (encodeURIComponent + per-byte decode) incorrectly
 * converted multi-byte UTF-8 sequences (e.g. Cyrillic %D0%BA) into garbage
 * Latin-1 characters.
 */
function encodeHumanReadable(str: string): string {
  return str.replace(/[&=+#%]/g, (c) => encodeURIComponent(c));
}

/**
 * Serialize the editable shape back into a URL string. Structural delimiters
 * (&, =, #) are always encoded when they appear inside keys/values, but
 * human-readable characters like quotes and brackets are kept unencoded.
 */
export function serializeUrl(parsed: ParsedUrl): string {
  const parts: string[] = [];
  for (const p of parsed.params) {
    // Skip params with empty key — they'd produce a malformed "=value" token.
    // Empty values are fine (e.g., ?flag=).
    if (p.key === '') continue;
    parts.push(`${encodeHumanReadable(p.key)}=${encodeHumanReadable(p.value)}`);
  }
  const query = parts.join('&');

  if (parsed.hashQuery) {
    // Hash-router: reconstruct as base + hashPath + ?query
    return `${parsed.base}${parsed.fragment}${query ? `?${query}` : ''}`;
  }
  return `${parsed.base}${query ? `?${query}` : ''}${parsed.fragment}`;
}

/**
 * Serialize the editable shape into a fully percent-encoded URL suitable for
 * navigation (Apply / Copy). All key and value characters are encoded via
 * encodeURIComponent so the browser receives a spec-compliant URL, matching
 * the original encoding of the page (e.g. JSON params stay as %7B...%7D).
 */
export function serializeUrlForNav(parsed: ParsedUrl): string {
  const parts: string[] = [];
  for (const p of parsed.params) {
    if (p.key === '') continue;
    parts.push(`${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`);
  }
  const query = parts.join('&');

  if (parsed.hashQuery) {
    return `${parsed.base}${parsed.fragment}${query ? `?${query}` : ''}`;
  }
  return `${parsed.base}${query ? `?${query}` : ''}${parsed.fragment}`;
}

/**
 * Detect whether a URL is editable by QueryCraft. Browser-internal pages
 * (chrome://, edge://, about:, devtools://, view-source:) cannot be navigated
 * via `chrome.tabs.update` from an extension.
 */
export function isEditableUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    const protocol = url.protocol.toLowerCase();
    return protocol === 'http:' || protocol === 'https:' || protocol === 'file:';
  } catch {
    return false;
  }
}

/** Create a fresh blank param (for the `+` action). */
export function createParam(key = '', value = '', type: ParamType = 'string'): QueryParam {
  return { id: generateId(), key, value, type };
}
