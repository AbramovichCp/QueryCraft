import { useId } from 'react';
import type { QueryParam } from '@/types';
import { tryParseStructured, shortPreview } from '@/lib/structuredParam';
import { ParamTextInput } from '../ParamTextInput';
import { BooleanToggle } from '../BooleanToggle';
import { RemoveParamButton } from '../RemoveParamButton';
import { IconChevronRightSmall } from '../icons';
import { CopyButton } from './CopyButton';
import styles from './ParamRow.module.css';

interface ParamRowProps {
  param: QueryParam;
  onKeyChange: (id: string, key: string) => void;
  onValueChange: (id: string, value: string) => void;
  onToggleBoolean: (id: string) => void;
  onRemove: (id: string) => void;
  onExpand?: () => void;
}

export function ParamRow({
  param,
  onKeyChange,
  onValueChange,
  onToggleBoolean,
  onRemove,
  onExpand,
}: ParamRowProps) {
  const keyId = useId();
  const valueId = useId();
  const keyName = param.key || '(empty key)';

  return (
    <li className={styles.row}>
      <div className={styles.keyCell}>
        <label htmlFor={keyId} className="visually-hidden">
          Parameter key
        </label>
        <div className={styles.fieldWrap}>
          <ParamTextInput
            id={keyId}
            variant="key"
            value={param.key}
            aria-label={`Key for parameter ${param.key || '(empty)'}`}
            onChange={(next) => onKeyChange(param.id, next)}
          />
          <CopyButton text={param.key} aria-label={`Copy key "${param.key}"`} />
        </div>
      </div>

      <div className={styles.valueCell}>
        <ValueCell
          param={param}
          valueId={valueId}
          keyName={keyName}
          onValueChange={onValueChange}
          onToggleBoolean={onToggleBoolean}
          onExpand={onExpand}
        />
      </div>

      <div className={styles.removeCell}>
        <RemoveParamButton paramKey={param.key} onRemove={() => onRemove(param.id)} />
      </div>
    </li>
  );
}

interface ValueCellProps {
  param: QueryParam;
  valueId: string;
  keyName: string;
  onValueChange: (id: string, value: string) => void;
  onToggleBoolean: (id: string) => void;
  onExpand?: () => void;
}

/** Renders the editor matching the param's detected type: toggle, JSON preview, or text. */
function ValueCell({
  param,
  valueId,
  keyName,
  onValueChange,
  onToggleBoolean,
  onExpand,
}: ValueCellProps) {
  if (param.type === 'boolean') {
    return (
      <>
        <label htmlFor={valueId} className="visually-hidden">
          {`Boolean value for ${param.key}`}
        </label>
        <div className={styles.fieldWrap}>
          <BooleanToggle
            id={valueId}
            value={param.value.toLowerCase() === 'true'}
            aria-label={`Toggle boolean value for ${param.key}`}
            onChange={() => onToggleBoolean(param.id)}
          />
          <CopyButton text={param.value} aria-label={`Copy value "${param.value}"`} />
        </div>
      </>
    );
  }

  if (param.type === 'structured') {
    const parsed = tryParseStructured(param.value);
    const preview = parsed === undefined ? param.value : shortPreview(parsed);
    return (
      <div className={styles.structuredValue}>
        <span className={styles.structuredPreview}>{preview}</span>
        <button
          type="button"
          className={styles.expandBtn}
          onClick={onExpand}
          aria-label={`Expand structured value for ${param.key}`}
          title="Expand structured value"
        >
          <IconChevronRightSmall />
        </button>
        <CopyButton
          text={param.value}
          aria-label={`Copy structured value for ${param.key}`}
          variant="inline"
        />
      </div>
    );
  }

  return (
    <>
      <label htmlFor={valueId} className="visually-hidden">
        {`Value for parameter ${param.key}`}
      </label>
      <div className={styles.fieldWrap}>
        <ParamTextInput
          id={valueId}
          variant="value"
          value={param.value}
          aria-label={`Value for parameter ${keyName}`}
          onChange={(next) => onValueChange(param.id, next)}
        />
        <CopyButton text={param.value} aria-label={`Copy value for parameter ${keyName}`} />
      </div>
    </>
  );
}
