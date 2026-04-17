import { useCallback, useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import type { ThemePreference } from '@/types';

type ResolvedTheme = 'light' | 'dark';

function resolveSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Manages theme preference (light | dark | system) with chrome.storage persistence.
 * Applies `data-theme` to <html>. Listens to system changes when pref is "system".
 */
export function useTheme(): {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (pref: ThemePreference) => void;
} {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [resolved, setResolved] = useState<ResolvedTheme>(resolveSystemTheme());

  // Load persisted preference once.
  useEffect(() => {
    let cancelled = false;
    storage.getTheme().then((pref) => {
      if (!cancelled) setPreferenceState(pref);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep resolved theme in sync with preference + system changes.
  useEffect(() => {
    if (preference === 'system') {
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => setResolved(e.matches ? 'dark' : 'light');
      setResolved(mql.matches ? 'dark' : 'light');
      // Chrome supports addEventListener on MediaQueryList in MV3 runtimes.
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    }
    setResolved(preference);
    return undefined;
  }, [preference]);

  // Apply to document root.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
  }, [resolved]);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    void storage.setTheme(pref);
  }, []);

  return { preference, resolved, setPreference };
}
