import { useId } from 'react';
import { IconSearch } from '../icons';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  /** Visually hidden label text. */
  label: string;
}

/** Filter field with an inset magnifier, per the redesign's content header. */
export function SearchInput({ value, onChange, placeholder, label }: SearchInputProps) {
  const id = useId();
  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <span className={styles.icon} aria-hidden="true">
        <IconSearch />
      </span>
      <input
        id={id}
        type="search"
        className={styles.input}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  );
}
