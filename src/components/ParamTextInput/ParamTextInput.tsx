import type { ChangeEvent } from 'react';
import styles from './ParamTextInput.module.css';

export type ParamInputVariant = 'key' | 'value' | 'add';

interface ParamTextInputProps {
  id: string;
  /**
   * "key" is the borderless filled label field, "value" the bordered mono
   * field, "add" the sans-serif field inside the add-parameter card.
   */
  variant: ParamInputVariant;
  value: string;
  placeholder?: string;
  'aria-label': string;
  onChange: (next: string) => void;
  onEnter?: () => void;
}

/** Text field for a parameter key or value cell. */
export function ParamTextInput({
  id,
  variant,
  value,
  placeholder,
  onChange,
  onEnter,
  'aria-label': ariaLabel,
}: ParamTextInputProps) {
  function onInput(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && onEnter) {
      e.preventDefault();
      onEnter();
    }
  }

  return (
    <input
      id={id}
      type="text"
      className={`${styles.input} ${styles[variant]}`}
      value={value}
      placeholder={placeholder}
      aria-label={ariaLabel}
      spellCheck={false}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      onChange={onInput}
      onKeyDown={onKeyDown}
    />
  );
}
