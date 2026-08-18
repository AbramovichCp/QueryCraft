import { useEffect, useMemo, useRef, useState } from 'react';
import type { Group, SavedLink } from '@/types';
import { DEFAULT_GROUP_ID } from '@/lib/storage';
import { SlidePanel } from '../SlidePanel';
import { SaveForm } from './SaveForm';
import { GroupedLinksList } from './GroupedLinksList';

type DrawerMode = 'list' | 'save' | 'edit';

interface SavedLinksDrawerProps {
  open: boolean;
  /** Mode to show when the drawer opens (e.g. jump straight to the save form). */
  initialMode?: 'list' | 'save';
  onClose: () => void;
  currentUrl: string;
  links: SavedLink[];
  groups: Group[];
  onSave: (input: { url: string; label?: string; groupId: string }) => void;
  onUpdateLink: (id: string, label: string | undefined, groupId: string) => void;
  onDeleteLink: (id: string) => void;
  onCreateGroup: (name: string) => Promise<Group>;
  onLoadLink: (url: string) => void;
}

const MODE_TITLES: Record<DrawerMode, string> = {
  list: 'Saved URLs',
  save: 'Save current URL',
  edit: 'Edit saved URL',
};

/**
 * Slide-in panel covering the editor. Role dialog with a focus trap.
 *
 * Three modes:
 *   - "list" (default): browse existing saved links, grouped.
 *   - "save": form to save the current URL with a label + group.
 *   - "edit": same form, editing an existing saved link.
 */
export function SavedLinksDrawer({
  open,
  initialMode = 'list',
  onClose,
  currentUrl,
  links,
  groups,
  onSave,
  onUpdateLink,
  onDeleteLink,
  onCreateGroup,
  onLoadLink,
}: SavedLinksDrawerProps) {
  const [mode, setMode] = useState<DrawerMode>('list');
  const [label, setLabel] = useState('');
  const [groupId, setGroupId] = useState(DEFAULT_GROUP_ID);
  const [editingLink, setEditingLink] = useState<SavedLink | null>(null);

  // Apply initialMode only on the closed → open transition, so re-renders
  // (or pressing Cmd+S while already open) don't yank the user out of a form.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open && !wasOpen.current) {
      setMode(initialMode);
      setEditingLink(null);
      setLabel('');
    }
    wasOpen.current = open;
  }, [open, initialMode]);

  // Group links by groupId for display. Preserve group order from the groups array.
  const linksByGroup = useMemo(() => {
    const map = new Map<string, SavedLink[]>();
    for (const g of groups) map.set(g.id, []);
    for (const l of links) {
      const target = map.get(l.groupId) ?? map.get(DEFAULT_GROUP_ID);
      target?.push(l);
    }
    return map;
  }, [links, groups]);

  function handleCreateNewGroup(name: string) {
    // Reuse an existing group instead of creating a same-named duplicate.
    const existing = groups.find((g) => g.name.trim().toLowerCase() === name.toLowerCase());
    if (existing) {
      setGroupId(existing.id);
      return;
    }
    void onCreateGroup(name).then((g) => setGroupId(g.id));
  }

  function backToList() {
    setEditingLink(null);
    setLabel('');
    setMode('list');
  }

  function handleSave() {
    onSave({ url: currentUrl, label: label.trim() || undefined, groupId });
    backToList();
  }

  function handleStartEdit(link: SavedLink) {
    setEditingLink(link);
    setLabel(link.label ?? '');
    setGroupId(link.groupId);
    setMode('edit');
  }

  function handleUpdate() {
    if (!editingLink) return;
    onUpdateLink(editingLink.id, label.trim() || undefined, groupId);
    backToList();
  }

  const showingForm = mode === 'save' || (mode === 'edit' && editingLink !== null);

  return (
    <SlidePanel
      open={open}
      title={MODE_TITLES[mode]}
      titleId="saved-links-title"
      onClose={onClose}
      onBack={showingForm ? backToList : undefined}
      backLabel="Back to saved list"
    >
      {showingForm ? (
        <SaveForm
          label={label}
          onLabelChange={setLabel}
          groupId={groupId}
          onGroupChange={setGroupId}
          groups={groups}
          onCreateNewGroup={handleCreateNewGroup}
          onSubmit={mode === 'edit' ? handleUpdate : handleSave}
          onCancel={backToList}
          previewUrl={mode === 'edit' && editingLink ? editingLink.url : currentUrl}
          submitLabel={mode === 'edit' ? 'Update' : 'Save'}
        />
      ) : (
        <GroupedLinksList
          groups={groups}
          linksByGroup={linksByGroup}
          onLoadLink={onLoadLink}
          onDeleteLink={onDeleteLink}
          onStartEdit={handleStartEdit}
          onStartSave={() => setMode('save')}
          canSave={!!currentUrl}
        />
      )}
    </SlidePanel>
  );
}
