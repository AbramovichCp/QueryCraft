import type { ParamType } from '@/types';
import { tryParseStructured } from './structuredParam';

/**
 * Heuristically detect the "type" of a parameter value to decide which editor to show.
 *
 * We're deliberately conservative: only exact "true"/"false" (case-insensitive) count
 * as booleans — strings like "yes", "1", "on" are left as plain strings to avoid
 * surprising the user when round-tripping. Numbers are plain decimals only
 * ("1e2" or ".5" would round-trip surprisingly, so they stay strings).
 */
export function detectParamType(value: string): ParamType {
  const lower = value.toLowerCase();
  if (lower === 'true' || lower === 'false') return 'boolean';
  if (/^-?\d+(\.\d+)?$/.test(value)) return 'number';
  if (tryParseStructured(value) !== undefined) return 'structured';
  return 'string';
}

/**
 * Flip a boolean-ish value, preserving the casing style the URL already used
 * so toggling `TRUE` yields `FALSE` and `False` yields `True` — round-tripping
 * a param should never reformat the rest of the query string.
 */
export function flipBoolean(value: string): string {
  const next = value.toLowerCase() === 'true' ? 'false' : 'true';
  if (value === value.toUpperCase() && value !== value.toLowerCase()) return next.toUpperCase();
  if (value[0] === value[0]?.toUpperCase() && value.slice(1) === value.slice(1).toLowerCase()) {
    return next[0].toUpperCase() + next.slice(1);
  }
  return next;
}
