import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconButton.module.css';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required for screen readers — there is no visible text. */
  'aria-label': string;
  icon: ReactNode;
  tone?: 'default' | 'danger' | 'accent';
  size?: 'sm' | 'md';
}

export function IconButton({
  icon,
  tone = 'default',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={[styles.root, styles[`tone-${tone}`], styles[`size-${size}`], className ?? '']
        .filter(Boolean)
        .join(' ')}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}
