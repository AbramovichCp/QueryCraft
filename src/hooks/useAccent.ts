import { useCallback, useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { isKnownAccent } from '@/lib/accents';
import { adjustForContrast, readableOn, withAlpha } from '@/lib/contrast';
import type { AccentColor } from '@/types';
import type { ResolvedTheme } from './useTheme';

/** Panel background per theme — the surface accent-colored text sits on. */
const PANEL_BG: Record<ResolvedTheme, string> = {
  light: '#ffffff',
  dark: '#262626',
};

/**
 * Custom properties the accent overrides. Listed so clearing an accent can
 * remove exactly what it set and let the stylesheet defaults win again.
 */
const VARS = [
  '--color-accent',
  '--color-accent-hover',
  '--color-on-accent',
  '--color-accent-text',
  '--color-accent-soft',
] as const;

function applyAccent(accent: AccentColor, theme: ResolvedTheme): void {
  const root = document.documentElement;
  if (!accent) {
    for (const v of VARS) root.style.removeProperty(v);
    return;
  }
  // Solid fills keep the exact swatch the user picked, so the button matches
  // the swatch. Only the *label* and text-on-panel uses are corrected, since
  // every swatch in this palette fails AA otherwise.
  root.style.setProperty('--color-accent', accent);
  root.style.setProperty('--color-accent-hover', adjustForContrast(accent, PANEL_BG[theme], 3));
  root.style.setProperty('--color-on-accent', readableOn(accent));
  root.style.setProperty('--color-accent-text', adjustForContrast(accent, PANEL_BG[theme]));
  root.style.setProperty('--color-accent-soft', withAlpha(accent, 0.15));
}

/**
 * Accent color state, persisted in chrome.storage and projected onto CSS
 * custom properties so components stay declarative — no component branches on
 * whether an accent is set.
 */
export function useAccent(theme: ResolvedTheme): {
  accent: AccentColor;
  setAccent: (next: AccentColor) => void;
} {
  const [accent, setAccentState] = useState<AccentColor>(null);

  // Load once. On storage failure keep monochrome rather than surfacing an
  // unhandled rejection.
  useEffect(() => {
    let cancelled = false;
    storage.getAccent().then(
      (stored) => {
        if (cancelled) return;
        // Guard against a value left by an older build or hand-edited storage.
        if (typeof stored === 'string' && isKnownAccent(stored)) setAccentState(stored);
      },
      () => undefined,
    );
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-apply on accent *or* theme change: the readable text variant depends on
  // which panel background it will sit on.
  useEffect(() => {
    applyAccent(accent, theme);
  }, [accent, theme]);

  const setAccent = useCallback((next: AccentColor) => {
    setAccentState(next);
    void storage.setAccent(next);
  }, []);

  return { accent, setAccent };
}
