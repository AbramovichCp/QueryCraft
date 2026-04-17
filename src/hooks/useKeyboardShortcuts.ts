import { useEffect } from 'react';

export interface Shortcut {
  /** Primary key (case-insensitive). Use key values from KeyboardEvent.key. */
  key: string;
  /** Require Cmd (mac) or Ctrl (win/linux). */
  mod?: boolean;
  shift?: boolean;
  handler: (e: KeyboardEvent) => void;
  /** Prevent default (e.g., to suppress browser save dialog on Cmd+S). */
  preventDefault?: boolean;
}

function matches(e: KeyboardEvent, s: Shortcut): boolean {
  const key = e.key.toLowerCase();
  if (key !== s.key.toLowerCase()) return false;
  const wantsMod = !!s.mod;
  const hasMod = e.metaKey || e.ctrlKey;
  if (wantsMod !== hasMod) return false;
  if ((s.shift ?? false) !== e.shiftKey) return false;
  return true;
}

/**
 * Register global keyboard shortcuts on the document. Each shortcut fires
 * regardless of the current focus target UNLESS the event target is an editable
 * field AND the shortcut has no modifier — in which case typing keys should
 * reach the field. Shortcuts WITH modifiers (Cmd+Enter, Cmd+S) always fire.
 */
export function useKeyboardShortcuts(shortcuts: Shortcut[]): void {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isEditable =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      for (const s of shortcuts) {
        if (!matches(e, s)) continue;
        // If the shortcut is unmodified AND we're in a text field, let the field handle it.
        if (!s.mod && !s.shift && isEditable) continue;
        if (s.preventDefault) e.preventDefault();
        s.handler(e);
        break;
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [shortcuts]);
}
