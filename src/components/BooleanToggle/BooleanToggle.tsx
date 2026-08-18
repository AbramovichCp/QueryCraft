import styles from './BooleanToggle.module.css';

interface BooleanToggleProps {
  id: string;
  value: boolean;
  'aria-label': string;
  onChange: (next: boolean) => void;
}

/**
 * Boolean toggle rendered as a button with role="switch".
 *
 * Space and Enter both activate it (native button semantics). We prevent
 * default on Space to stop the popup from scrolling. The literal value text
 * sits next to it in ParamRow, so the state is never carried by color alone.
 */
export function BooleanToggle({
  id,
  value,
  onChange,
  'aria-label': ariaLabel,
}: BooleanToggleProps) {
  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === ' ') {
      e.preventDefault();
      onChange(!value);
    }
  }

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
      className={[styles.track, value ? styles.on : ''].filter(Boolean).join(' ')}
      onClick={() => onChange(!value)}
      onKeyDown={onKeyDown}
    >
      <span className={styles.thumb} aria-hidden="true" />
    </button>
  );
}
