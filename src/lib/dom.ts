/**
 * True when a keyboard event's target is a field that consumes typing —
 * global shortcuts without modifiers should not fire while the user types.
 */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  );
}
