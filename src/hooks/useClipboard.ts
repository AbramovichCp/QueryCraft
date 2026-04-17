import { useCallback, useRef, useState } from 'react';

/**
 * Clipboard hook for popup context. `navigator.clipboard.writeText` works
 * without the `clipboardWrite` permission because a popup is a secure context
 * and a user click supplies the required user gesture.
 */
export function useClipboard(resetAfterMs = 1500): {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
} {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => setCopied(false), resetAfterMs);
        return true;
      } catch {
        return false;
      }
    },
    [resetAfterMs],
  );

  return { copied, copy };
}
