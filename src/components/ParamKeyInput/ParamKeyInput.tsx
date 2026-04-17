import type { ChangeEvent } from 'react';
import styles from './ParamKeyInput.module.css';

interface ParamKeyInputProps {
  id: string;
  value: string;
  placeholder?: string;
  'aria-label': string;
  onChange: (next: string) => void;
  onEnter?: () => void;
}

export function ParamKeyInput({
  id,
  value,
  placeholder,
  onChange,
  onEnter,
  'aria-label': ariaLabel,
}: ParamKeyInputProps) {
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
      className={styles.input}
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
