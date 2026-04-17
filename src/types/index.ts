/**
 * Core domain types for QueryCraft.
 */

/** Detected/assigned type of a parameter value — drives which editor control is rendered. */
export type ParamType = 'string' | 'boolean' | 'number';

/**
 * A single query parameter. We keep the `id` stable across edits so React reconciliation
 * and focus management don't trip over reordering (e.g., two params with the same key).
 */
export interface QueryParam {
  id: string;
  key: string;
  value: string;
  type: ParamType;
}

/**
 * A parsed URL split into the static base and editable parameters.
 * Fragment (`#hash`) is preserved verbatim and re-appended on serialization.
 */
export interface ParsedUrl {
  base: string; // origin + pathname, e.g. "https://example.com/api/v1/search"
  params: QueryParam[];
  fragment: string; // includes leading "#" or empty string
}

export interface SavedLink {
  id: string;
  url: string;
  label?: string;
  createdAt: number;
  groupId: string;
}

export interface Group {
  id: string;
  name: string;
  createdAt: number;
}

export type ThemePreference = 'light' | 'dark' | 'system';

/** Special state when the active tab's URL is a browser-internal page we can't edit. */
export type TabLoadState =
  | { status: 'loading' }
  | { status: 'ready'; tabId: number; url: string }
  | { status: 'unsupported'; reason: string }
  | { status: 'error'; message: string };
