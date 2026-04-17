import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders an icon node before the label. */
  leadingIcon?: ReactNode;
  /** Renders an icon node after the label. */
  trailingIcon?: ReactNode;
  /** Full-width within its parent. */
  block?: boolean;
}

export function Button({
  variant = 'ghost',
  size = 'md',
  leadingIcon,
  trailingIcon,
  block = false,
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={[
        styles.root,
        styles[`variant-${variant}`],
        styles[`size-${size}`],
        block ? styles.block : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {leadingIcon && <span className={styles.icon} aria-hidden="true">{leadingIcon}</span>}
      <span className={styles.label}>{children}</span>
      {trailingIcon && <span className={styles.icon} aria-hidden="true">{trailingIcon}</span>}
    </button>
  );
}
