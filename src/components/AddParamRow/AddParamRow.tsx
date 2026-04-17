import { useId, useRef, useState } from 'react';
import { IconButton } from '../IconButton';
import { IconPlus } from '../icons';
import { ParamKeyInput } from '../ParamKeyInput';
import { ParamValueInput } from '../ParamValueInput';
import styles from './AddParamRow.module.css';

interface AddParamRowProps {
  onAdd: (key: string, value: string) => void;
}

/**
 * The "add new parameter" row at the bottom of the list.
 *
 * Behavior:
 * - `+` button is disabled while key is empty (aria-disabled too, so SR announces)
 * - Enter in either field commits, clears both, and returns focus to the key field
 * - Matches the visual rhythm of ParamRow via identical grid columns
 */
export function AddParamRow({ onAdd }: AddParamRowProps) {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const keyInputRef = useRef<HTMLDivElement>(null);
  const keyId = useId();
  const valueId = useId();

  const canAdd = key.trim().length > 0;

  function commit() {
    if (!canAdd) return;
    onAdd(key, value);
    setKey('');
    setValue('');
    // Return focus to key field for fast repeated additions.
    const input = keyInputRef.current?.querySelector<HTMLInputElement>('input');
    input?.focus();
  }

  return (
    <div className={styles.row} role="group" aria-label="Add a new parameter">
      <div className={styles.keyCell} ref={keyInputRef}>
        <label htmlFor={keyId} className="visually-hidden">
          New parameter key
        </label>
        <ParamKeyInput
          id={keyId}
          value={key}
          placeholder="Key"
          aria-label="New parameter key"
          onChange={setKey}
          onEnter={commit}
        />
      </div>

      <div className={styles.valueCell}>
        <label htmlFor={valueId} className="visually-hidden">
          New parameter value
        </label>
        <ParamValueInput
          id={valueId}
          value={value}
          placeholder="Value"
          aria-label="New parameter value"
          onChange={setValue}
          onEnter={commit}
        />
      </div>

      <div className={styles.actionCell}>
        <IconButton
          aria-label="Add parameter"
          aria-disabled={!canAdd}
          disabled={!canAdd}
          tone="accent"
          size="sm"
          icon={<IconPlus />}
          onClick={commit}
        />
      </div>
    </div>
  );
}
