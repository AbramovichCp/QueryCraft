import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

interface ToastProps {
  /** Changing this shows the pill and re-announces. Cleared after `duration`. */
  message: string;
  duration?: number;
  politeness?: 'polite' | 'assertive';
}

/**
 * Floating status pill, bottom-centered, auto-dismissing.
 *
 * This doubles as the app's single aria-live region: the visible toast and the
 * announcement are the same node, so screen-reader users hear each status once
 * rather than twice (which is what a separate hidden region would cause).
 */
export function Toast({ message, duration = 1600, politeness = 'polite' }: ToastProps) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (!message) return;
    // Clear first, then set — ensures repeated identical messages re-announce.
    setText('');
    const show = window.setTimeout(() => setText(message), 50);
    const hide = window.setTimeout(() => setText(''), duration + 50);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [message, duration]);

  return (
    <div className={styles.region} role="status" aria-live={politeness} aria-atomic="true">
      {text && <span className={styles.toast}>{text}</span>}
    </div>
  );
}
