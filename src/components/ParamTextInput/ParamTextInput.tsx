import type { ChangeEvent } from 'react';
import styles from './ParamTextInput.module.css';

interface ParamTextInputProps {
  id: string;
  /** "key" renders in the accent color; "value" gets ellipsis + focus expand. */
  variant: 'key' | 'value';
  value: string;
  placeholder?: string;
  'aria-label': string;
  onChange: (next: string) => void;
  onEnter?: () => void;
}

/** Monospace text field for a parameter key or value cell. */
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
