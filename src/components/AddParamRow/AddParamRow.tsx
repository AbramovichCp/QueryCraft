import { useId, useRef, useState } from 'react';
import { IconButton } from '../IconButton';
import { IconPlus } from '../icons';
import { ParamTextInput } from '../ParamTextInput';
import styles from './AddParamRow.module.css';

interface AddParamRowProps {
  onAdd: (key: string, value: string) => void;
}

/**
 * The "add new parameter" card at the bottom of the list.
 *
 * Behavior:
 * - `+` button is disabled while key is empty (aria-disabled too, so SR announces)
 * - Enter in either field commits, clears both, and returns focus to the key field
 * - Key/value columns match ParamRow's 32% split so the cards read as one rhythm
 */
export function AddParamRow({ onAdd }: AddParamRowProps) {
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const keyCellRef = useRef<HTMLDivElement>(null);
  const keyId = useId();
  const valueId = useId();

  const canAdd = key.trim().length > 0;

  function commit() {
    if (!canAdd) return;
    // Trim the key: stray spaces would silently become %20 in the URL.
    onAdd(key.trim(), value);
    setKey('');
    setValue('');
    // Return focus to key field for fast repeated additions.
    keyCellRef.current?.querySelector('input')?.focus();
  }

  return (
    <section className={styles.card} aria-labelledby={`${keyId}-title`}>
      <div className={styles.cardHeader}>
        <h3 id={`${keyId}-title`} className={styles.cardTitle}>
          Add parameter
        </h3>
      </div>

      <div className={styles.row}>
        <div className={styles.keyCell} ref={keyCellRef}>
          <label htmlFor={keyId} className="visually-hidden">
            New parameter key
          </label>
          <ParamTextInput
            id={keyId}
            variant="add"
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
          <ParamTextInput
            id={valueId}
            variant="add"
            value={value}
            placeholder="Value"
            aria-label="New parameter value"
            onChange={setValue}
            onEnter={commit}
          />
        </div>

        <IconButton
          aria-label="Add parameter"
          aria-disabled={!canAdd}
          disabled={!canAdd}
          variant="filled"
          size="xl"
          icon={<IconPlus />}
          onClick={commit}
        />
      </div>
    </section>
  );
}
