/**
 * Utilities for structured (object / array) query-parameter values.
 *
 * A value is "structured" if its raw query-string representation is valid JSON
 * that resolves to an object or array. Anything else is treated as a plain string.
 */

/** True when `raw` is a JSON-encoded object or array. */
export function isStructured(raw: string): boolean {
  const t = raw.trim();
  if (t[0] !== '{' && t[0] !== '[') return false;
  try {
    const v = JSON.parse(t);
    return typeof v === 'object' && v !== null;
  } catch {
    return false;
  }
}

/** Parse a raw query-param value. Caller must guard with {@link isStructured}. */
export function parseStructuredValue(raw: string): unknown {
  return JSON.parse(raw);
}

/** Serialise a JS value back to its query-param string representation. */
export function serializeStructuredValue(value: unknown): string {
  return JSON.stringify(value);
}

/**
 * One-line human-friendly preview:
 * - Objects: first 2 entries + "…" if more
 * - Arrays:  first 3 items  + "…" if more
 */
export function shortPreview(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length === 0) return '[ ]';
    const items = value.slice(0, 3).map((v) => JSON.stringify(v));
    return `[${items.join(', ')}${value.length > 3 ? ', …' : ''}]`;
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{ }';
    const shown = entries
      .slice(0, 2)
      .map(([k, v]) => `"${k}":${JSON.stringify(v)}`);
    return `{${shown.join(',')}${entries.length > 2 ? ',…' : ''}}`;
  }
  return JSON.stringify(value);
}

/**
 * Immutable deep-set — returns a new root with the leaf at `path` replaced by
 * `newValue`. Intermediate nodes that are missing or wrong-typed are recreated.
 */
export function setAtPath(
  root: unknown,
  path: (string | number)[],
  newValue: unknown,
): unknown {
  if (path.length === 0) return newValue;

  const [head, ...tail] = path;

  if (typeof head === 'number') {
    const arr = Array.isArray(root) ? [...root] : [];
    arr[head] = setAtPath(arr[head], tail, newValue);
    return arr;
  }

  const obj: Record<string, unknown> =
    typeof root === 'object' && root !== null && !Array.isArray(root)
      ? { ...(root as Record<string, unknown>) }
      : {};
  obj[head] = setAtPath(obj[head], tail, newValue);
  return obj;
}

/** Read-only deep-get. Returns `undefined` for invalid paths. */
export function getAtPath(root: unknown, path: (string | number)[]): unknown {
  let cur = root;
  for (const key of path) {
    if (cur === null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string | number, unknown>)[key];
  }
  return cur;
}

/**
 * Coerce an edited string back to the original leaf type so we don't
 * accidentally stringify numbers or booleans.
 */
export function coerceLeaf(draft: string, original: unknown): unknown {
  if (original === null) return null;
  if (typeof original === 'boolean') return draft.toLowerCase() === 'true';
  if (typeof original === 'number') {
    const n = Number(draft);
    return Number.isNaN(n) ? draft : n;
  }
  return draft;
}

/** True for objects and arrays (i.e. values that can be drilled into). */
export function isContainer(value: unknown): boolean {
  return typeof value === 'object' && value !== null;
}
