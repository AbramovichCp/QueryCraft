import { useEffect, useId, useRef, useState } from 'react';
import type { Group } from '@/types';
import { Button } from '../Button';
import styles from './GroupSelector.module.css';

interface GroupSelectorProps {
  groups: Group[];
  value: string;
  onChange: (groupId: string) => void;
  /** Called with the trimmed name when the user confirms the inline "new group" form. */
  onCreateNew: (name: string) => void;
  label?: string;
}

const CREATE_NEW_VALUE = '__create_new__';

/**
 * A native <select> for picking a group, with a "+ Create new group" option
 * at the top. Native select is deliberate: it's fully keyboard-accessible by
 * default and screen readers handle it well, no custom ARIA combobox needed.
 *
 * Choosing "+ Create new group…" swaps in an inline name input. This must NOT
 * use window.prompt: modal JS dialogs are suppressed inside MV3 extension
 * popups, so a prompt would silently return null.
 */
export function GroupSelector({
  groups,
  value,
  onChange,
  onCreateNew,
  label = 'Group',
}: GroupSelectorProps) {
  const id = useId();
  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  function onSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    if (next === CREATE_NEW_VALUE) {
      setCreating(true);
      return;
    }
    onChange(next);
  }

  function confirmCreate() {
    const name = draftName.trim();
    if (!name) return;
    onCreateNew(name);
    setDraftName('');
    setCreating(false);
  }

  function cancelCreate() {
    setDraftName('');
    setCreating(false);
    // Hand focus back to the select so keyboard users aren't dropped.
    selectRef.current?.focus();
  }

  return (
    <div className={styles.wrapper}>
      <label htmlFor={creating ? `${id}-new` : id} className={styles.label}>
        {creating ? 'New group name' : label}
      </label>

      {creating ? (
        <div className={styles.createRow}>
          <input
            ref={inputRef}
            id={`${id}-new`}
            type="text"
            className={styles.createInput}
            value={draftName}
            placeholder="e.g. Staging"
            maxLength={40}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                confirmCreate();
              }
              if (e.key === 'Escape') {
                // Cancel only the inline form — stop the event so the drawer
                // (focus trap listens on document) doesn't close too.
                e.preventDefault();
                e.stopPropagation();
                cancelCreate();
              }
            }}
          />
          <Button variant="primary" size="sm" onClick={confirmCreate} disabled={!draftName.trim()}>
            Add
          </Button>
          <Button variant="ghost" size="sm" onClick={cancelCreate}>
            Cancel
          </Button>
        </div>
      ) : (
        <select
          ref={selectRef}
          id={id}
          className={styles.select}
          value={value}
          onChange={onSelectChange}
        >
          <option value={CREATE_NEW_VALUE}>+ Create new group…</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
