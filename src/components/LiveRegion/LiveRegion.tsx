import { useEffect, useState } from 'react';

interface LiveRegionProps {
  /** Changing this prop causes the region to re-announce. */
  message: string;
  politeness?: 'polite' | 'assertive';
}

/**
 * Global aria-live region for announcements (param added, URL applied, copied, etc.).
 *
 * We briefly clear the text after each announcement so that announcing the same
 * message twice in a row still triggers screen reader output.
 */
export function LiveRegion({ message, politeness = 'polite' }: LiveRegionProps) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (!message) return;
    // Clear first, then set — ensures repeated identical messages get announced.
    setText('');
    const id = window.setTimeout(() => setText(message), 50);
    return () => window.clearTimeout(id);
  }, [message]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="visually-hidden"
    >
      {text}
    </div>
  );
}
