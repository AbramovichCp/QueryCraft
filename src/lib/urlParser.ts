import type { ParsedUrl, QueryParam, ParamType } from '@/types';
import { detectParamType } from './paramTypes';
import { tryParseStructured } from './structuredParam';
import { generateId } from './id';

/**
 * Normalize a decoded param value: structured (JSON object/array) values are
 * compacted via JSON.parse → JSON.stringify to strip any whitespace that was
 * baked in by pretty-printing (e.g. %0A%09 newline/tab sequences). This keeps
 * p.value consistent and prevents literal whitespace from leaking into the URL.
 */
function normalizeValue(raw: string): string {
  const parsed = tryParseStructured(raw);
  return parsed === undefined ? raw : JSON.stringify(parsed);
}

/** Build a QueryParam from a decoded key/value pair. */
function makeParam(key: string, rawValue: string): QueryParam {
  const value = normalizeValue(rawValue);
  return { id: generateId(), key, value, type: detectParamType(value) };
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

  // Base = full URL minus query and fragment. Built by stripping the parsed
  // URL rather than `origin + pathname`: origin is the literal string "null"
  // for file: URLs (outside Chrome) and drops credentials (user:pass@).
  const stripped = new URL(url);
  stripped.search = '';
  stripped.hash = '';
  const base = stripped.href;

  const params: QueryParam[] = [];

  // Hash-router pattern: query params live inside the hash fragment.
  // e.g. https://app.com/#/route?foo=bar  →  hash = "#/route?foo=bar"
  // Only kicks in when something follows the "?" — a plain anchor that merely
  // ends in "?" (e.g. "#Why?") stays an opaque fragment.
  const hashQueryIdx = url.hash.indexOf('?');
  const hashSearch = hashQueryIdx === -1 ? '' : url.hash.slice(hashQueryIdx + 1);

  if (hashSearch !== '') {
    const hashPath = url.hash.slice(0, hashQueryIdx); // e.g. "#/route"

    for (const [key, value] of new URLSearchParams(hashSearch).entries()) {
      params.push(makeParam(key, value));
    }

    // A URL can carry BOTH a real query string and a hash query
    // (https://app.com/path?main=1#/route?foo=bar). Only the hash query is
    // editable in this mode; keep the real one verbatim as part of the base
    // so it survives serialization instead of being silently dropped.
    return { base: `${base}${url.search}`, params, fragment: hashPath, hashQuery: true };
  }

  // Regular query params.
  for (const [key, value] of url.searchParams.entries()) {
    params.push(makeParam(key, value));
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
