import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconButton.module.css';

export type IconButtonVariant = 'plain' | 'bordered' | 'filled';
export type IconButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required for screen readers — there is no visible text. */
  'aria-label': string;
  icon: ReactNode;
  /** "plain" for in-row controls, "bordered" for the header, "filled" for add. */
  variant?: IconButtonVariant;
  tone?: 'default' | 'danger';
  /** sm 24px (rows) · md 26px (panels) · lg 28px (header) · xl 32px (add). */
  size?: IconButtonSize;
}

const SIZE_CLASS: Record<IconButtonSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
};

export function IconButton({
  icon,
  variant = 'plain',
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
      className={[
        styles.root,
        styles[variant],
        SIZE_CLASS[size],
        tone === 'danger' ? styles.danger : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}
