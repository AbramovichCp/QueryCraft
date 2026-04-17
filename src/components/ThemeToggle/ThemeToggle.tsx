import { useEffect, useRef, useState } from 'react';
import type { ThemePreference } from '@/types';
import { IconMonitor, IconMoon, IconSun } from '../icons';
import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  preference: ThemePreference;
  onChange: (pref: ThemePreference) => void;
}

interface Option {
  value: ThemePreference;
  label: string;
  icon: React.ReactNode;
}

const OPTIONS: Option[] = [
  { value: 'light', label: 'Light', icon: <IconSun /> },
  { value: 'system', label: 'System', icon: <IconMonitor /> },
  { value: 'dark', label: 'Dark', icon: <IconMoon /> },
];

export function ThemeToggle({ preference, onChange }: ThemeToggleProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const current = OPTIONS.find((o) => o.value === preference) ?? OPTIONS[1];

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <button
        type="button"
        aria-label={`Theme: ${current.label}. Click to change.`}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.icon} aria-hidden="true">
          {current.icon}
        </span>
      </button>

      {open && (
        <div role="listbox" aria-label="Select theme" className={styles.dropdown}>
          {OPTIONS.map((opt) => {
            const selected = preference === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={selected}
                className={[styles.option, selected ? styles.selected : ''].join(' ')}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <span className={styles.optionIcon} aria-hidden="true">
                  {opt.icon}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
