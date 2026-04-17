import { useId } from 'react';
import type { Group } from '@/types';
import styles from './GroupSelector.module.css';

interface GroupSelectorProps {
  groups: Group[];
  value: string;
  onChange: (groupId: string) => void;
  onCreateNew: () => void;
  label?: string;
}

const CREATE_NEW_VALUE = '__create_new__';

/**
 * A native <select> for picking a group, with a "+ Create new group" option
 * at the top. Native select is deliberate: it's fully keyboard-accessible by
 * default and screen readers handle it well, no custom ARIA combobox needed.
 */
export function GroupSelector({
  groups,
  value,
  onChange,
  onCreateNew,
  label = 'Group',
}: GroupSelectorProps) {
  const id = useId();

  function onSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    if (next === CREATE_NEW_VALUE) {
      onCreateNew();
      return;
    }
    onChange(next);
  }

  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <select id={id} className={styles.select} value={value} onChange={onSelectChange}>
        <option value={CREATE_NEW_VALUE}>+ Create new group…</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
    </div>
  );
}
