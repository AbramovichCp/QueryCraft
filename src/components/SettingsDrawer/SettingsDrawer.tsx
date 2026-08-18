import type { CSSProperties } from 'react';
import type { AccentColor } from '@/types';
import { ACCENTS } from '@/lib/accents';
import { readableOn } from '@/lib/contrast';
import { SlidePanel } from '../SlidePanel';
import { IconCheck } from '../icons';
import styles from './SettingsDrawer.module.css';

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  accent: AccentColor;
  onAccentChange: (accent: AccentColor) => void;
}

/** Settings panel — currently just the accent color picker. */
export function SettingsDrawer({ open, onClose, accent, onAccentChange }: SettingsDrawerProps) {
  return (
    <SlidePanel open={open} title="Settings" titleId="settings-title" onClose={onClose}>
      <span className={styles.sectionLabel} id="accent-label">
        Accent color
      </span>

      {/*
        radiogroup rather than a list of buttons: exactly one accent is active,
        and this gives arrow-key navigation and "3 of 10" announcements free.
      */}
      <div className={styles.grid} role="radiogroup" aria-labelledby="accent-label">
        {ACCENTS.map((c) => {
          const selected = accent === c.hex;
          return (
            <button
              key={c.hex}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={c.name}
              title={c.name}
              className={`${styles.swatch} ${selected ? styles.selected : ''}`}
              style={
                {
                  background: c.hex,
                  '--swatch-check-color': readableOn(c.hex),
                } as CSSProperties
              }
              onClick={() => onAccentChange(c.hex)}
            >
              {selected && (
                <span className={styles.check}>
                  <IconCheck />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className={styles.reset}
        onClick={() => onAccentChange(null)}
        disabled={accent === null}
      >
        Reset to monochrome
      </button>

      <p className={styles.hint}>
        Light and dark follow your system appearance automatically.
      </p>
    </SlidePanel>
  );
}
