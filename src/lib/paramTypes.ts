import type { ParamType } from '@/types';

/**
 * Heuristically detect the "type" of a parameter value to decide which editor to show.
 *
 * We're deliberately conservative: only exact "true"/"false" (case-insensitive) count
 * as booleans — strings like "yes", "1", "on" are left as plain strings to avoid
 * surprising the user when round-tripping.
 */
export function detectParamType(value: string): ParamType {
  const lower = value.toLowerCase();
  if (lower === 'true' || lower === 'false') return 'boolean';
  // Number detection: only non-empty finite numbers. Avoids classifying "" or "NaN" as number.
  if (value !== '' && Number.isFinite(Number(value)) && !/^\s*$/.test(value)) {
    // Additional guard: strings like "1e2" are technically numbers but likely user intent is string.
    // We only accept digits, optional leading -, and a single decimal point.
    if (/^-?\d+(\.\d+)?$/.test(value)) return 'number';
  }
  // Structured detection: valid JSON object or array.
  const trimmed = value.trim();
  if (trimmed[0] === '{' || trimmed[0] === '[') {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (typeof parsed === 'object' && parsed !== null) return 'structured';
    } catch {
      // fall through to string
    }
  }
  return 'string';
}
