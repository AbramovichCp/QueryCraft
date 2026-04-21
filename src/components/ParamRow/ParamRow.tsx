import { useId } from 'react';
import type { QueryParam } from '@/types';
import { parseStructuredValue, shortPreview } from '@/lib/structuredParam';
import { ParamKeyInput } from '../ParamKeyInput';
import { ParamValueInput } from '../ParamValueInput';
import { BooleanToggle } from '../BooleanToggle';
import { RemoveParamButton } from '../RemoveParamButton';
import styles from './ParamRow.module.css';

interface ParamRowProps {
  param: QueryParam;
  onKeyChange: (id: string, key: string) => void;
  onValueChange: (id: string, value: string) => void;
  onToggleBoolean: (id: string) => void;
  onRemove: (id: string) => void;
  onExpand?: () => void;
  isDsl?: boolean;
  onExpandDsl?: () => void;
}

const ChevronRight = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M4.5 3L7.5 6L4.5 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function ParamRow({
  param,
  onKeyChange,
  onValueChange,
  onToggleBoolean,
  onRemove,
  onExpand,
  isDsl,
  onExpandDsl,
}: ParamRowProps) {
  const keyId = useId();
  const valueId = useId();

  const isBool = param.type === 'boolean';
  const isStructured = param.type === 'structured';

  let structuredPreviewText = '';
  if (isStructured) {
    try {
      structuredPreviewText = shortPreview(parseStructuredValue(param.value));
    } catch {
      structuredPreviewText = param.value;
    }
  }

  // DSL preview: show the raw string truncated
  const dslPreviewText = isDsl ? param.value.replace(/^"|"$/g, '') : '';

  return (
    <li className={styles.row}>
      <div className={styles.keyCell}>
        <label htmlFor={keyId} className="visually-hidden">
          Parameter key
        </label>
        <ParamKeyInput
          id={keyId}
          value={param.key}
          aria-label={`Key for parameter ${param.key || '(empty)'}`}
          onChange={(next) => onKeyChange(param.id, next)}
        />
      </div>

      <div className={styles.valueCell}>
        {isBool ? (
          <>
            <label htmlFor={valueId} className="visually-hidden">
              {`Boolean value for ${param.key}`}
            </label>
            <BooleanToggle
              id={valueId}
              value={param.value.toLowerCase() === 'true'}
              aria-label={`Toggle boolean value for ${param.key}`}
              onChange={() => onToggleBoolean(param.id)}
            />
          </>
        ) : isDsl ? (
          <div className={styles.structuredValue}>
            <span className={styles.structuredPreview}>{dslPreviewText}</span>
            <span className={styles.dslBadge}>DSL</span>
            <button
              className={styles.expandBtn}
              onClick={onExpandDsl}
              aria-label={`Open DSL editor for ${param.key}`}
              title="Open DSL editor"
            >
              <ChevronRight />
            </button>
          </div>
        ) : isStructured ? (
          <div className={styles.structuredValue}>
            <span className={styles.structuredPreview}>{structuredPreviewText}</span>
            <button
              className={styles.expandBtn}
              onClick={onExpand}
              aria-label={`Expand structured value for ${param.key}`}
              title="Expand structured value"
            >
              <ChevronRight />
            </button>
          </div>
        ) : (
          <>
            <label htmlFor={valueId} className="visually-hidden">
              {`Value for parameter ${param.key}`}
            </label>
            <ParamValueInput
              id={valueId}
              value={param.value}
              aria-label={`Value for parameter ${param.key || '(empty key)'}`}
              onChange={(next) => onValueChange(param.id, next)}
            />
          </>
        )}
      </div>

      <div className={styles.removeCell}>
        <RemoveParamButton paramKey={param.key} onRemove={() => onRemove(param.id)} />
      </div>
    </li>
  );
}
