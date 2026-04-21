import { useState } from 'react';
import type { DslPreset } from '@/types';
import styles from './PresetsSettings.module.css';

interface PresetsSettingsProps {
  presets: DslPreset[];
  onAdd: (data: { name: string; paramMatchers: string[] }) => Promise<void>;
  onUpdate: (id: string, changes: Partial<Pick<DslPreset, 'name' | 'paramMatchers'>>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

interface EditingPreset {
  name: string;
  matchers: string; // comma-separated
}

export function PresetsSettings({
  presets,
  onAdd,
  onUpdate,
  onDelete,
  onClose,
}: PresetsSettingsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<EditingPreset>({ name: '', matchers: '' });
  const [addDraft, setAddDraft] = useState<EditingPreset>({ name: '', matchers: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  function startEdit(preset: DslPreset) {
    setEditingId(preset.id);
    setEditDraft({ name: preset.name, matchers: preset.paramMatchers.join(', ') });
  }

  async function commitEdit(id: string) {
    await onUpdate(id, {
      name: editDraft.name.trim(),
      paramMatchers: parseMatchers(editDraft.matchers),
    });
    setEditingId(null);
  }

  async function commitAdd() {
    const name = addDraft.name.trim();
    const matchers = parseMatchers(addDraft.matchers);
    if (!name || matchers.length === 0) return;
    await onAdd({ name, paramMatchers: matchers });
    setAddDraft({ name: '', matchers: '' });
    setShowAddForm(false);
  }

  function parseMatchers(raw: string): string[] {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Presets</h2>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close settings">
          ×
        </button>
      </div>

      <p className={styles.description}>
        Presets let you define a structured DSL editor for specific query parameters. When a
        parameter key matches a preset's patterns, a{' '}
        <span className={styles.dslBadgeInline}>DSL</span> badge appears and you can open
        the visual editor.
      </p>

      <ul className={styles.list} role="list">
        {presets.map((preset) => (
          <li key={preset.id} className={styles.item}>
            {preset.isBuiltIn ? (
              /* Built-in preset — read-only */
              <div className={styles.builtInPreset}>
                <div className={styles.itemHeader}>
                  <span className={styles.presetName}>{preset.name}</span>
                  <span className={styles.builtInBadge}>Built-in</span>
                </div>
                <p className={styles.matchersDisplay}>
                  Matches:{' '}
                  {preset.paramMatchers.map((m) => (
                    <code key={m} className={styles.matcherChip}>
                      {m}
                    </code>
                  ))}
                </p>
              </div>
            ) : editingId === preset.id ? (
              /* User preset — edit form */
              <div className={styles.editForm}>
                <label className={styles.formLabel}>
                  Name
                  <input
                    className={styles.formInput}
                    value={editDraft.name}
                    onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                    autoFocus
                  />
                </label>
                <label className={styles.formLabel}>
                  Param key patterns
                  <input
                    className={styles.formInput}
                    value={editDraft.matchers}
                    placeholder="*-filters, my-param, custom-*"
                    onChange={(e) => setEditDraft((d) => ({ ...d, matchers: e.target.value }))}
                  />
                  <span className={styles.formHint}>Comma-separated. Use * as wildcard.</span>
                </label>
                <div className={styles.editActions}>
                  <button
                    className={styles.saveBtn}
                    onClick={() => void commitEdit(preset.id)}
                    disabled={!editDraft.name.trim()}
                  >
                    Save
                  </button>
                  <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* User preset — display row */
              <div className={styles.userPreset}>
                <div className={styles.itemHeader}>
                  <span className={styles.presetName}>{preset.name}</span>
                  <div className={styles.itemActions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => startEdit(preset)}
                      aria-label={`Edit preset ${preset.name}`}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => void onDelete(preset.id)}
                      aria-label={`Delete preset ${preset.name}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className={styles.matchersDisplay}>
                  Matches:{' '}
                  {preset.paramMatchers.map((m) => (
                    <code key={m} className={styles.matcherChip}>
                      {m}
                    </code>
                  ))}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Add new preset */}
      {showAddForm ? (
        <div className={styles.addForm}>
          <label className={styles.formLabel}>
            Name
            <input
              className={styles.formInput}
              value={addDraft.name}
              placeholder="My Filter Preset"
              onChange={(e) => setAddDraft((d) => ({ ...d, name: e.target.value }))}
              autoFocus
            />
          </label>
          <label className={styles.formLabel}>
            Param key patterns
            <input
              className={styles.formInput}
              value={addDraft.matchers}
              placeholder="*-filters, my-param, custom-*"
              onChange={(e) => setAddDraft((d) => ({ ...d, matchers: e.target.value }))}
            />
            <span className={styles.formHint}>Comma-separated. Use * as wildcard.</span>
          </label>
          <div className={styles.editActions}>
            <button
              className={styles.saveBtn}
              onClick={() => void commitAdd()}
              disabled={!addDraft.name.trim() || !addDraft.matchers.trim()}
            >
              Add
            </button>
            <button
              className={styles.cancelBtn}
              onClick={() => {
                setShowAddForm(false);
                setAddDraft({ name: '', matchers: '' });
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button className={styles.addPresetBtn} onClick={() => setShowAddForm(true)}>
          + Add preset
        </button>
      )}
    </div>
  );
}
