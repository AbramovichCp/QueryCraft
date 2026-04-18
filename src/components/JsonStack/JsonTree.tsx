import { useState } from 'react';
import { isContainer, shortPreview } from '@/lib/structuredParam';
import { JsonLeafInput } from './JsonLeafInput';
import styles from './JsonTree.module.css';

interface JsonTreeProps {
  value: unknown;
  onPush: (key: string | number) => void;
  onLeafChange: (key: string | number, newValue: unknown) => void;
  onKeyChange?: (oldKey: string, newKey: string) => void;
}

function EditableKey({ k, onCommit }: { k: string; onCommit: (newKey: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(k);

  if (editing) {
    return (
      <input
        className={styles.keyInput}
        value={draft}
        autoFocus
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          onCommit(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
          if (e.key === 'Escape') {
            setDraft(k);
            setEditing(false);
          }
        }}
        spellCheck={false}
        aria-label={`Rename key ${k}`}
      />
    );
  }

  return (
    <span
      className={styles.objectKey}
      onClick={(e) => {
        e.stopPropagation();
        setDraft(k);
        setEditing(true);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          setDraft(k);
          setEditing(true);
        }
      }}
    >
      "{k}"
    </span>
  );
}

export function JsonTree({ value, onPush, onLeafChange, onKeyChange }: JsonTreeProps) {
  const isArr = Array.isArray(value);
  const entries: [string | number, unknown][] = isArr
    ? (value as unknown[]).map((v, i) => [i, v])
    : Object.entries(value as Record<string, unknown>);

  if (entries.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyLabel}>{isArr ? 'empty array' : 'empty object'}</span>
      </div>
    );
  }

  return (
    <div className={styles.tree} role="list">
      {entries.map(([k, v]) => {
        const container = isContainer(v);
        return (
          <div
            key={String(k)}
            className={container ? styles.containerRow : styles.leafRow}
            role={container ? 'button' : 'listitem'}
            tabIndex={container ? 0 : undefined}
            onClick={container ? () => onPush(k) : undefined}
            onKeyDown={
              container
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onPush(k);
                    }
                  }
                : undefined
            }
            aria-label={container ? `Drill into ${String(k)}` : undefined}
          >
            {!isArr && onKeyChange ? (
              <EditableKey k={String(k)} onCommit={(newKey) => onKeyChange(String(k), newKey)} />
            ) : isArr ? (
              <span className={styles.indexKey}>{k}</span>
            ) : (
              <span className={styles.objectKey}>"{k}"</span>
            )}
            <span className={styles.colon}>{' : '}</span>
            {container ? (
              <>
                <span className={styles.preview}>{shortPreview(v)}</span>
                <span className={styles.chevron}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M4.5 3L7.5 6L4.5 9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </>
            ) : (
              <JsonLeafInput value={v} onCommit={(nv) => onLeafChange(k, nv)} />
            )}
          </div>
        );
      })}
    </div>
  );
}
