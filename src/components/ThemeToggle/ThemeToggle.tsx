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
  { value: 'light', label: 'Light theme', icon: <IconSun /> },
  { value: 'system', label: 'System theme', icon: <IconMonitor /> },
  { value: 'dark', label: 'Dark theme', icon: <IconMoon /> },
];

/**
 * Segmented control implemented as a radio group. Each button carries
 * role="radio" and the group carries role="radiogroup", which screen readers
 * announce with the current selection and arrow-key navigation semantics.
 */
export function ThemeToggle({ preference, onChange }: ThemeToggleProps) {
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const idx = OPTIONS.findIndex((o) => o.value === preference);
    const next =
      e.key === 'ArrowRight'
        ? OPTIONS[(idx + 1) % OPTIONS.length]
        : OPTIONS[(idx - 1 + OPTIONS.length) % OPTIONS.length];
    onChange(next.value);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={styles.group}
      onKeyDown={onKeyDown}
    >
      {OPTIONS.map((opt) => {
        const selected = preference === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={opt.label}
            tabIndex={selected ? 0 : -1}
            className={[styles.item, selected ? styles.selected : ''].join(' ')}
            onClick={() => onChange(opt.value)}
          >
            <span className={styles.icon} aria-hidden="true">
              {opt.icon}
            </span>
          </button>
        );
      })}
    </div>
  );
}
