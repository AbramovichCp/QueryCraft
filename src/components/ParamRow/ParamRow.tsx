import { useId } from 'react';
import type { QueryParam } from '@/types';
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
}

export function ParamRow({
  param,
  onKeyChange,
  onValueChange,
  onToggleBoolean,
  onRemove,
}: ParamRowProps) {
  const keyId = useId();
  const valueId = useId();

  const isBool = param.type === 'boolean';

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
        <label htmlFor={valueId} className="visually-hidden">
          {isBool ? `Boolean value for ${param.key}` : `Value for parameter ${param.key}`}
        </label>
        {isBool ? (
          <BooleanToggle
            id={valueId}
            value={param.value.toLowerCase() === 'true'}
            aria-label={`Toggle boolean value for ${param.key}`}
            onChange={() => onToggleBoolean(param.id)}
          />
        ) : (
          <ParamValueInput
            id={valueId}
            value={param.value}
            aria-label={`Value for parameter ${param.key || '(empty key)'}`}
            onChange={(next) => onValueChange(param.id, next)}
          />
        )}
      </div>

      <div className={styles.removeCell}>
        <RemoveParamButton paramKey={param.key} onRemove={() => onRemove(param.id)} />
      </div>
    </li>
  );
}
