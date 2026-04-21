import { useRef } from 'react';
import {
  parseDsl,
  serializeDsl,
  removeTokenAt,
  toggleLogicAt,
  updatePredicateAt,
  appendPredicate,
  KNOWN_OPERATORS,
  OPERATOR_LABELS,
} from '@/lib/dslParser';
import type { DslToken, DslPredicate } from '@/types';
import styles from './DslEditorPanel.module.css';

interface DslEditorPanelProps {
  paramKey: string;
  value: string;
  viewMode: 'structured' | 'raw';
  onViewModeChange: (mode: 'structured' | 'raw') => void;
  onChange: (newValue: string) => void;
  onClose: () => void;
}

export function DslEditorPanel({
  paramKey,
  value,
  viewMode,
  onViewModeChange,
  onChange,
  onClose,
}: DslEditorPanelProps) {
  // Raw textarea draft — only used when in 'raw' mode
  const rawDraftRef = useRef<HTMLTextAreaElement>(null);

  const tokens = parseDsl(value);
  const serialized = serializeDsl(tokens);

  function commit(newTokens: DslToken[]) {
    onChange(serializeDsl(newTokens));
  }

  function switchToRaw() {
    onViewModeChange('raw');
  }

  function switchToStructured() {
    // Commit any pending raw edits before switching
    if (rawDraftRef.current && rawDraftRef.current.value !== value) {
      onChange(rawDraftRef.current.value);
    }
    onViewModeChange('structured');
  }

  let predicateNum = 0;

  return (
    <div className={styles.panel}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.paramKey}>{paramKey}</span>
          <span className={styles.filterBadge}>FILTER-DSL</span>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.toggle} role="group" aria-label="View mode">
            <button
              className={`${styles.toggleBtn} ${viewMode === 'structured' ? styles.toggleActive : ''}`}
              onClick={switchToStructured}
            >
              Structured
            </button>
            <button
              className={`${styles.toggleBtn} ${viewMode === 'raw' ? styles.toggleActive : ''}`}
              onClick={switchToRaw}
            >
              Raw
            </button>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close DSL editor">
            ×
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.body}>
        {viewMode === 'structured' ? (
          <div className={styles.structured}>
            {tokens.length === 0 && (
              <p className={styles.emptyHint}>No predicates yet. Add one below.</p>
            )}

            {tokens.map((token, i) => {
              if (token.kind === 'logic') {
                return (
                  <div key={i} className={styles.logicRow}>
                    <div className={styles.logicLine} />
                    <button
                      className={`${styles.logicBtn} ${token.op === 'AND' ? styles.logicAND : styles.logicOR}`}
                      onClick={() => commit(toggleLogicAt(tokens, i))}
                      title="Click to toggle AND / OR"
                    >
                      {token.op}
                    </button>
                    <div className={styles.logicLine} />
                    <button
                      className={styles.removeLogicBtn}
                      onClick={() => commit(removeTokenAt(tokens, i))}
                      aria-label={`Remove ${token.op} and following predicate`}
                      title="Remove this connector and the predicate below it"
                    >
                      ×
                    </button>
                  </div>
                );
              }

              const pred = token as DslPredicate;
              predicateNum++;
              const num = predicateNum;
              const isKnownOp = (KNOWN_OPERATORS as readonly string[]).includes(pred.operator);

              return (
                <div key={i} className={styles.predicateRow}>
                  <span className={styles.predicateNum}>{num}</span>
                  <div className={styles.predicateInputs}>
                    <input
                      className={styles.fieldInput}
                      value={pred.field}
                      placeholder="field"
                      aria-label={`Field for predicate ${num}`}
                      onChange={(e) =>
                        commit(updatePredicateAt(tokens, i, { field: e.target.value }))
                      }
                    />
                    <select
                      className={styles.operatorSelect}
                      value={pred.operator}
                      aria-label={`Operator for predicate ${num}`}
                      onChange={(e) =>
                        commit(updatePredicateAt(tokens, i, { operator: e.target.value }))
                      }
                    >
                      {KNOWN_OPERATORS.map((op) => (
                        <option key={op} value={op}>
                          {OPERATOR_LABELS[op] ?? op}
                        </option>
                      ))}
                      {!isKnownOp && (
                        <option value={pred.operator}>{pred.operator}</option>
                      )}
                    </select>
                    <input
                      className={styles.valueInput}
                      value={pred.value}
                      placeholder="value"
                      aria-label={`Value for predicate ${num}`}
                      onChange={(e) =>
                        commit(updatePredicateAt(tokens, i, { value: e.target.value }))
                      }
                    />
                  </div>
                  <button
                    className={styles.removePredicateBtn}
                    onClick={() => commit(removeTokenAt(tokens, i))}
                    aria-label={`Remove predicate ${num}`}
                  >
                    ×
                  </button>
                </div>
              );
            })}

            <button className={styles.addBtn} onClick={() => commit(appendPredicate(tokens))}>
              + Add predicate
            </button>
          </div>
        ) : (
          <textarea
            ref={rawDraftRef}
            className={styles.rawEditor}
            defaultValue={value}
            onBlur={(e) => onChange(e.target.value)}
            spellCheck={false}
            aria-label="Raw DSL string"
          />
        )}
      </div>

      {/* ── Raw preview at bottom (always visible in structured mode) ── */}
      {viewMode === 'structured' && (
        <div className={styles.rawPreview}>
          <span className={styles.rawPreviewText}>{serialized}</span>
        </div>
      )}
    </div>
  );
}
