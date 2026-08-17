import { useEffect, useRef, useState } from 'react';
import { IconCheck, IconCopy } from '../icons';
import styles from './ParamRow.module.css';

interface CopyButtonProps {
  /** Text to copy; the button is a no-op when empty. */
  text: string;
  'aria-label': string;
  /** "overlay" floats over an input on hover; "inline" sits in a flex row. */
  variant?: 'overlay' | 'inline';
}

const RESET_AFTER_MS = 1500;

/**
 * Hover-revealed copy button for a param field. Shows a check for a moment
 * after copying. Excluded from the tab order — the field itself is the
 * keyboard target, and keyboard users can copy from it directly.
 */
export function CopyButton({ text, 'aria-label': ariaLabel, variant = 'overlay' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleCopy() {
    if (!text) return;
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopied(false), RESET_AFTER_MS);
    });
  }

  const base = variant === 'inline' ? styles.copyBtnInline : styles.copyBtn;
  return (
    <button
      type="button"
      className={`${base}${copied ? ` ${styles.copied}` : ''}`}
      onClick={handleCopy}
      aria-label={ariaLabel}
      tabIndex={-1}
    >
      {copied ? <IconCheck /> : <IconCopy />}
    </button>
  );
}
