import { useState } from 'react';
import styles from './RawJsonEditor.module.css';

interface RawJsonEditorProps {
  value: unknown;
  onChange: (newValue: unknown) => void;
}

export function RawJsonEditor({ value, onChange }: RawJsonEditorProps) {
  const [draft, setDraft] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);

  function handleBlur() {
    try {
      const parsed: unknown = JSON.parse(draft);
      setError(null);
      onChange(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }
  }

  return (
    <div className={styles.root}>
      <textarea
        className={`${styles.textarea} ${error ? styles.hasError : ''}`}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          if (error) setError(null);
        }}
        onBlur={handleBlur}
        spellCheck={false}
        autoComplete="off"
        aria-label="Raw JSON editor"
      />
      {error && <p className={styles.errorMsg}>{error}</p>}
    </div>
  );
}
