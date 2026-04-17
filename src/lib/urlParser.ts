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
      params.push({ id: generateId(), key, value, type: detectParamType(value) });
    }

    return { base, params, fragment: hashPath, hashQuery: true };
  }

  // Regular query params.
  for (const [key, value] of url.searchParams.entries()) {
    params.push({
      id: generateId(),
      key,
      value,
      type: detectParamType(value),
    });
  }

  return { base, params, fragment: url.hash, hashQuery: false };
}

/**
 * Encode a query key or value for display: percent-encode only characters that are
 * structurally significant in a query string (&, =, +, #, %) so the URL stays
 * human-readable (e.g. `"`, `(`, `)`, `[`, `]` are shown as-is).
 */
function encodeHumanReadable(str: string): string {
  return encodeURIComponent(str).replace(/%([0-9A-F]{2})/gi, (match, hex) => {
    const char = String.fromCharCode(parseInt(hex, 16));
    return '&=+#%'.includes(char) ? match : char;
  });
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
