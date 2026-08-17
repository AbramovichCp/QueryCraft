/**
 * Generate a unique ID. Uses crypto.randomUUID when available (all modern
 * Chrome), falling back to timestamp + random for robustness in tests.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
