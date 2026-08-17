import type { Group } from '@/types';
import { Button } from '../Button';
import { GroupSelector } from '../GroupSelector';
import styles from './SavedLinksDrawer.module.css';

interface SaveFormProps {
  label: string;
  onLabelChange: (v: string) => void;
  groupId: string;
  onGroupChange: (id: string) => void;
  groups: Group[];
  onCreateNewGroup: (name: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  previewUrl: string;
  submitLabel?: string;
}

/** Shared form body for both "save current URL" and "edit saved URL" modes. */
export function SaveForm({
  label,
  onLabelChange,
  groupId,
  onGroupChange,
  groups,
  onCreateNewGroup,
  onSubmit,
  onCancel,
  previewUrl,
  submitLabel = 'Save',
}: SaveFormProps) {
  const labelId = 'sl-label';
  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label htmlFor={labelId} className={styles.fieldLabel}>
          Label (optional)
        </label>
        <input
          id={labelId}
          type="text"
          className={styles.textInput}
          value={label}
          onChange={(e) => onLabelChange(e.target.value)}
          placeholder="e.g. Staging with debug flag"
          maxLength={80}
        />
      </div>

      <GroupSelector
        groups={groups}
        value={groupId}
        onChange={onGroupChange}
        onCreateNew={onCreateNewGroup}
      />

      <div className={styles.field}>
        <span className={styles.fieldLabel}>URL</span>
        <div className={styles.urlPreview} title={previewUrl}>
          {previewUrl}
        </div>
      </div>

      <div className={styles.formActions}>
        <Button variant="primary" onClick={onSubmit}>
          {submitLabel}
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
