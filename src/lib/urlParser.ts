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
  const fragment = url.hash; // includes "#" or ""

  const params: QueryParam[] = [];
  // Iterate on the raw search string (minus "?") so we preserve order AND duplicates.
  // URLSearchParams iteration works in insertion order too, but using entries() is cleaner.
  for (const [key, value] of url.searchParams.entries()) {
    params.push({
      id: generateId(),
      key,
      value,
      type: detectParamType(value),
    });
  }

  return { base, params, fragment };
}

/**
 * Serialize the editable shape back into a URL string. Values are percent-encoded
 * via URLSearchParams; keys are also encoded (so `filters[category]` becomes
 * `filters%5Bcategory%5D` which is the correct wire format and decodes back identically).
 */
export function serializeUrl(parsed: ParsedUrl): string {
  const search = new URLSearchParams();
  for (const p of parsed.params) {
    // Skip params with empty key — they'd produce a malformed "=value" token.
    // Empty values are fine (e.g., ?flag=).
    if (p.key === '') continue;
    search.append(p.key, p.value);
  }
  const query = search.toString();
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
