import { useEffect } from 'react';
import { tabs } from '@/lib/tabs';
import { useAppStore } from '@/store/useAppStore';

/**
 * On popup mount, resolves the active tab's URL and loads it into the store.
 * Handles edge cases: no active tab, browser-internal URLs, permission denials.
 */
export function useActiveTabUrl(): void {
  const loadUrl = useAppStore((s) => s.loadUrl);
  const loadUnsupported = useAppStore((s) => s.loadUnsupported);
  const setTabState = useAppStore((s) => s.setTabState);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const tab = await tabs.getActive();
        if (cancelled) return;
        if (!tab) {
          loadUnsupported("Couldn't read the active tab.");
          return;
        }
        loadUrl(tab.url, tab.id);
      } catch (err) {
        if (cancelled) return;
        setTabState({
          status: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadUrl, loadUnsupported, setTabState]);
}
