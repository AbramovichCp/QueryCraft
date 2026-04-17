import { useEffect, useRef, useState } from 'react';
import { coerceLeaf } from '@/lib/structuredParam';
import styles from './JsonLeafInput.module.css';

function leafClass(value: unknown): string {
  if (value === null) return styles.typeNull;
  switch (typeof value) {
    case 'boolean': return styles.typeBool;
    case 'number':  return styles.typeNumber;
    case 'string':  return styles.typeString;
    default:        return '';
  }
}

function formatLeaf(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  return String(value);
}

interface JsonLeafInputProps {
  value: unknown;
  onCommit: (newValue: unknown) => void;
}

export function JsonLeafInput({ value, onCommit }: JsonLeafInputProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  function startEdit() {
    setDraft(value === null ? 'null' : String(value));
    setEditing(true);
  }

  function commit() {
    setEditing(false);
    onCommit(coerceLeaf(draft, value));
  }

  function cancel() {
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        className={styles.input}
        value={draft}
        autoFocus
        style={{ width: Math.max(60, draft.length * 8 + 16) }}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); commit(); }
          if (e.key === 'Escape') { e.preventDefault(); cancel(); }
        }}
      />
    );
  }

  return (
    <span
      className={`${styles.leaf} ${leafClass(value)}`}
      role="button"
      tabIndex={0}
      onClick={startEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startEdit(); }
      }}
      aria-label={`Edit value: ${String(value)}`}
    >
      {formatLeaf(value)}
    </span>
  );
}
