import type { DslToken, DslPredicate, DslLogic, DslPreset } from '@/types';

/** Operators supported by the editor (displayed in the select dropdown). */
export const KNOWN_OPERATORS = [
  'not_contains',
  'not_in',
  'is_not',
  'contains',
  'between',
  'gte',
  'lte',
  'is',
  'in',
  'gt',
  'lt',
] as const;

export const OPERATOR_LABELS: Record<string, string> = {
  is: 'is',
  is_not: 'is not',
  in: 'in',
  not_in: 'not in',
  contains: 'contains',
  not_contains: 'not contains',
  between: 'between',
  gt: '>',
  lt: '<',
  gte: '>=',
  lte: '<=',
};

/**
 * Built-in "DefaultPresetExample" preset — matches the Cato Networks filter DSL.
 * Matches any param key that ends with "-filters" or "-filter".
 */
export const DEFAULT_BUILTIN_PRESET: DslPreset = {
  id: 'builtin-cato-filter',
  name: 'DefaultPresetExample',
  paramMatchers: ['*-filters', '*-filter'],
  isBuiltIn: true,
};

/**
 * Parse a DSL string like:
 *   "(field-op-value)AND(field-op-value)OR(field-op-value)"
 *   or with outer quotes: '"(field-op-value)AND..."'
 *
 * Returns an array of DslToken (alternating predicates and logic operators).
 */
export function parseDsl(raw: string): DslToken[] {
  let str = raw.trim();
  if (str.startsWith('"') && str.endsWith('"')) {
    str = str.slice(1, -1);
  }

  const tokens: DslToken[] = [];
  const regex = /\(([^)]+)\)|(AND|OR)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(str)) !== null) {
    if (match[1] !== undefined) {
      const pred = parsePredicate(match[1]);
      if (pred) tokens.push(pred);
    } else if (match[2]) {
      tokens.push({ kind: 'logic', op: match[2] as 'AND' | 'OR' });
    }
  }

  return tokens;
}

function parsePredicate(inner: string): DslPredicate | null {
  // Split by '-'; first segment = field, second = operator, rest joined = value.
  // Operators always use '_' internally, never '-', so they appear as one segment.
  const parts = inner.split('-');
  if (parts.length < 2) return null;
  const field = parts[0];
  const operator = parts[1];
  const value = parts.slice(2).join('-');
  if (!field || !operator) return null;
  return { kind: 'predicate', field, operator, value };
}

/** Serialize tokens back to a quoted DSL string: "(field-op-val)AND..." */
export function serializeDsl(tokens: DslToken[]): string {
  const inner = tokens
    .map((t) => (t.kind === 'logic' ? t.op : `(${t.field}-${t.operator}-${t.value})`))
    .join('');
  return `"${inner}"`;
}

/** Heuristic: does this raw param value look like a filter DSL? */
export function looksLikeDsl(value: string): boolean {
  const s = value.trim();
  const inner = s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1) : s;
  return /^\([^)]+\)/.test(inner);
}

/** Simple glob matching — `*` matches any sequence of characters. */
export function matchesGlob(pattern: string, key: string): boolean {
  if (pattern === '*') return true;
  if (!pattern.includes('*')) return pattern === key;
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  return new RegExp('^' + escaped.replace(/\*/g, '.*') + '$').test(key);
}

/** Find the first preset whose paramMatchers glob-match the given param key. */
export function findMatchingPreset(key: string, presets: DslPreset[]): DslPreset | null {
  for (const preset of presets) {
    for (const pattern of preset.paramMatchers) {
      if (matchesGlob(pattern, key)) return preset;
    }
  }
  return null;
}

/**
 * Remove the token at index `i`, keeping the structure valid:
 * - predicate → also remove adjacent logic (prefer before, fallback after)
 * - logic     → also remove the following predicate
 */
export function removeTokenAt(tokens: DslToken[], i: number): DslToken[] {
  const arr = [...tokens];
  const token = arr[i];
  if (token.kind === 'predicate') {
    if (i > 0 && arr[i - 1].kind === 'logic') {
      arr.splice(i - 1, 2);
    } else if (i < arr.length - 1 && arr[i + 1].kind === 'logic') {
      arr.splice(i, 2);
    } else {
      arr.splice(i, 1);
    }
  } else {
    if (i < arr.length - 1) {
      arr.splice(i, 2);
    } else {
      arr.splice(i, 1);
    }
  }
  return arr;
}

/** Toggle the logic operator at index `i` between AND and OR. */
export function toggleLogicAt(tokens: DslToken[], i: number): DslToken[] {
  return tokens.map((t, idx): DslToken =>
    idx === i && t.kind === 'logic' ? { kind: 'logic', op: t.op === 'AND' ? 'OR' : 'AND' } : t,
  );
}

/** Update the predicate at token index `i` with the given changes. */
export function updatePredicateAt(
  tokens: DslToken[],
  i: number,
  changes: Partial<Pick<DslPredicate, 'field' | 'operator' | 'value'>>,
): DslToken[] {
  return tokens.map((t, idx): DslToken =>
    idx === i && t.kind === 'predicate' ? { ...t, ...changes } : t,
  );
}

/** Append a new empty predicate (with an AND logic separator if list is non-empty). */
export function appendPredicate(tokens: DslToken[]): DslToken[] {
  const newPred: DslPredicate = { kind: 'predicate', field: '', operator: 'is', value: '' };
  if (tokens.length === 0) return [newPred];
  const logic: DslLogic = { kind: 'logic', op: 'AND' };
  return [...tokens, logic, newPred];
}
