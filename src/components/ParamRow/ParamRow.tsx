import { useId } from 'react';
import type { QueryParam } from '@/types';
import { tryParseStructured, shortPreview } from '@/lib/structuredParam';
import { ParamTextInput } from '../ParamTextInput';
import { BooleanToggle } from '../BooleanToggle';
import { IconButton } from '../IconButton';
import { IconChevronRight, IconClose } from '../icons';
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
          {`Key for parameter ${keyName}`}
        </label>
        <ParamTextInput
          id={keyId}
          variant="key"
          value={param.key}
          aria-label={`Key for parameter ${keyName}`}
          onChange={(next) => onKeyChange(param.id, next)}
        />
        <CopyButton text={param.key} aria-label={`Copy key "${param.key}"`} />
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

      <IconButton
        aria-label={param.key ? `Remove parameter ${param.key}` : 'Remove empty parameter'}
        icon={<IconClose />}
        size="sm"
        tone="danger"
        onClick={() => onRemove(param.id)}
      />
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
      <div className={styles.boolValue}>
        <BooleanToggle
          id={valueId}
          value={param.value.toLowerCase() === 'true'}
          aria-label={`Toggle value for ${keyName}`}
          onChange={() => onToggleBoolean(param.id)}
        />
        {/* Literal value, casing preserved — never color alone. */}
        <span className={styles.boolLabel}>{param.value}</span>
      </div>
    );
  }

  if (param.type === 'structured') {
    const parsed = tryParseStructured(param.value);
    const preview = parsed === undefined ? param.value : shortPreview(parsed);
    return (
      <div className={styles.structuredValue}>
        <span className={styles.structuredPreview}>{preview}</span>
        <CopyButton
          text={param.value}
          aria-label={`Copy structured value for ${keyName}`}
          variant="inline"
        />
        <IconButton
          aria-label={`Expand structured value for ${keyName}`}
          title="Expand structured value"
          icon={<IconChevronRight />}
          size="sm"
          onClick={onExpand}
        />
      </div>
    );
  }

  return (
    <>
      <label htmlFor={valueId} className="visually-hidden">
        {`Value for parameter ${keyName}`}
      </label>
      <ParamTextInput
        id={valueId}
        variant="value"
        value={param.value}
        placeholder="(empty)"
        aria-label={`Value for parameter ${keyName}`}
        onChange={(next) => onValueChange(param.id, next)}
      />
      <CopyButton text={param.value} aria-label={`Copy value for parameter ${keyName}`} />
    </>
  );
}
