import { useCallback, useMemo, useState } from 'react';
import { useAppStore, selectCurrentUrl, selectNavUrl } from '@/store/useAppStore';
import { useActiveTabUrl } from '@/hooks/useActiveTabUrl';
import { useClipboard } from '@/hooks/useClipboard';
import { useTheme } from '@/hooks/useTheme';
import { useAccent } from '@/hooks/useAccent';
import { useSavedLinks } from '@/hooks/useSavedLinks';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { tabs } from '@/lib/tabs';
import { parseUrl } from '@/lib/urlParser';
import { Header } from '@/components/Header';
import { UrlPreview } from '@/components/UrlPreview';
import { ParamList } from '@/components/ParamList';
import { ActionBar } from '@/components/ActionBar';
import { IconButton } from '@/components/IconButton';
import { IconBookmark, IconSettings } from '@/components/icons';
import { Toast } from '@/components/Toast';
import { SavedLinksDrawer } from '@/components/SavedLinksDrawer';
import { SettingsDrawer } from '@/components/SettingsDrawer';
import { EmptyState } from '@/components/EmptyState';
import styles from './App.module.css';

export function App() {
  // Load URL on mount, hydrate theme, bind storage-backed saved links.
  useActiveTabUrl();
  const theme = useTheme();
  const { accent, setAccent } = useAccent(theme);

  // Zustand store — individual selectors keep re-renders narrow.
  const tabState = useAppStore((s) => s.tabState);
  const currentParsed = useAppStore((s) => s.currentParsed);
  const announcement = useAppStore((s) => s.announcement);
  const setCurrentUrl = useAppStore((s) => s.setCurrentUrl);
  const updateKey = useAppStore((s) => s.updateParamKey);
  const updateValue = useAppStore((s) => s.updateParamValue);
  const toggleBool = useAppStore((s) => s.toggleBooleanParam);
  const removeParam = useAppStore((s) => s.removeParam);
  const addParam = useAppStore((s) => s.addParam);
  const resetStore = useAppStore((s) => s.reset);
  const announce = useAppStore((s) => s.announce);

  const currentUrl = useAppStore(selectCurrentUrl); // human-readable, for display
  const navUrl = useAppStore(selectNavUrl); // encoded, for Apply / Copy

  const { copied, copy } = useClipboard();
  const { links, groups, saveLink, updateLink, deleteLink, createGroup } = useSavedLinks();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'list' | 'save'>('list');
  const [settingsOpen, setSettingsOpen] = useState(false);

  /* ---------- Action handlers ---------- */

  const handleApply = useCallback(async () => {
    // Read fresh state at call time to avoid stale-closure issues: the user
    // may click Apply immediately after adding a param, before React has
    // re-rendered and updated the closure-captured navUrl / tabState.
    const snap = useAppStore.getState();
    const currentTabState = snap.tabState;
    const currentNavUrl = selectNavUrl(snap);
    if (currentTabState.status !== 'ready' || !currentNavUrl) return;
    try {
      await tabs.updateUrl(currentTabState.tabId, currentNavUrl);
      announce('URL applied to the current tab');
    } catch (err) {
      announce(`Failed to apply: ${err instanceof Error ? err.message : 'unknown error'}`);
    }
  }, [announce]);

  const handleReset = useCallback(() => {
    resetStore();
  }, [resetStore]);

  const handleCopy = useCallback(async () => {
    if (!navUrl) return;
    const ok = await copy(navUrl);
    announce(ok ? 'URL copied to clipboard' : 'Failed to copy URL');
  }, [navUrl, copy, announce]);

  const handleOpenDrawer = useCallback(() => {
    setDrawerMode('list');
    setDrawerOpen(true);
  }, []);

  /** The action bar's "Save" button jumps straight to the save form. */
  const handleOpenSaveDrawer = useCallback(() => {
    setDrawerMode('save');
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setSettingsOpen(false);
  }, []);

  /** Escape closes whichever panel is on top. */
  const handleEscape = useCallback(() => {
    setSettingsOpen(false);
    setDrawerOpen(false);
  }, []);

  const handleUpdateLink = useCallback(
    (id: string, label: string | undefined, groupId: string) => {
      void updateLink(id, label, groupId).then(
        () => announce('Saved URL updated'),
        () => announce('Failed to update saved URL'),
      );
    },
    [updateLink, announce],
  );

  const handleSaveLink = useCallback(
    ({ url, label, groupId }: { url: string; label?: string; groupId: string }) => {
      void saveLink({ url, label, groupId }).then(
        () => announce('URL saved'),
        () => announce('Failed to save URL'),
      );
    },
    [saveLink, announce],
  );

  const handleDeleteLink = useCallback(
    (id: string) => {
      void deleteLink(id).then(
        () => announce('Saved URL deleted'),
        () => announce('Failed to delete saved URL'),
      );
    },
    [deleteLink, announce],
  );

  const handleLoadSavedLink = useCallback(
    (url: string) => {
      const snap = useAppStore.getState().tabState;
      const tabId =
        snap.status === 'ready' || snap.status === 'unsupported' ? snap.tabId : undefined;
      if (tabId === undefined) {
        announce('Cannot load the saved URL: no editable tab');
        return;
      }
      try {
        // Replace the editor state with the saved URL without touching the
        // actual tab — the user can hit Apply to navigate.
        const parsed = parseUrl(url);
        const snapshot = () => ({ ...parsed, params: parsed.params.map((p) => ({ ...p })) });
        useAppStore.setState({
          tabState: { status: 'ready', tabId, url },
          initialParsed: snapshot(),
          currentParsed: snapshot(),
          announcement: 'Loaded saved URL',
        });
      } catch {
        announce('Failed to load saved URL');
      }
      setDrawerOpen(false);
    },
    [announce],
  );

  /* ---------- Keyboard shortcuts ---------- */

  const shortcuts = useMemo(
    () => [
      { key: 'Enter', mod: true, preventDefault: true, handler: () => void handleApply() },
      { key: 's', mod: true, preventDefault: true, handler: handleOpenDrawer },
      { key: 'Escape', handler: handleEscape },
    ],
    [handleApply, handleOpenDrawer, handleEscape],
  );
  useKeyboardShortcuts(shortcuts);

  /* ---------- Render ---------- */

  const headerActions = (
    <>
      <IconButton
        aria-label="Settings"
        title="Settings"
        icon={<IconSettings />}
        variant="bordered"
        size="lg"
        onClick={handleOpenSettings}
      />
      <IconButton
        aria-label="Open saved URLs"
        title="Saved URLs"
        icon={<IconBookmark />}
        variant="bordered"
        size="lg"
        onClick={handleOpenDrawer}
      />
    </>
  );

  return (
    <div className={styles.app}>
      <Header actions={headerActions} />

      {tabState.status === 'loading' && (
        <EmptyState title="Loading…" message="Reading the active tab's URL." />
      )}

      {tabState.status === 'unsupported' && (
        <EmptyState
          title="This page can't be edited"
          message="QueryCraft works on http, https, and file URLs. Browser-internal pages are not supported."
        />
      )}

      {tabState.status === 'error' && (
        <EmptyState title="Something went wrong" message={tabState.message} />
      )}

      {tabState.status === 'ready' && currentParsed && (
        <>
          <div className={styles.scrollArea}>
            <UrlPreview parsed={currentParsed} onUrlChange={setCurrentUrl} />
            <ParamList
              params={currentParsed.params}
              onKeyChange={updateKey}
              onValueChange={updateValue}
              onToggleBoolean={toggleBool}
              onRemove={removeParam}
              onAdd={addParam}
            />
          </div>
          <ActionBar
            onApply={() => void handleApply()}
            onReset={handleReset}
            onCopy={() => void handleCopy()}
            onSave={handleOpenSaveDrawer}
            copied={copied}
            applyDisabled={!navUrl}
          />
        </>
      )}

      <Toast message={announcement} />

      <SavedLinksDrawer
        open={drawerOpen}
        initialMode={drawerMode}
        onClose={handleCloseDrawer}
        currentUrl={currentUrl}
        links={links}
        groups={groups}
        onSave={handleSaveLink}
        onUpdateLink={handleUpdateLink}
        onDeleteLink={handleDeleteLink}
        onCreateGroup={createGroup}
        onLoadLink={handleLoadSavedLink}
      />

      <SettingsDrawer
        open={settingsOpen}
        onClose={handleCloseSettings}
        accent={accent}
        onAccentChange={setAccent}
      />
    </div>
  );
}
