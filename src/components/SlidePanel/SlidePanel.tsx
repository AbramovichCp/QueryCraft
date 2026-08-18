import type { ReactNode } from 'react';
import { IconButton } from '../IconButton';
import { IconChevronLeft, IconClose } from '../icons';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import styles from './SlidePanel.module.css';

interface SlidePanelProps {
  open: boolean;
  title: string;
  /** Stable id for the heading, referenced by aria-labelledby. */
  titleId: string;
  onClose: () => void;
  /** When given, a back chevron is shown to the left of the title. */
  onBack?: () => void;
  backLabel?: string;
  children: ReactNode;
}

/**
 * The shared chrome for every side panel: slides in from the right, traps
 * focus, and renders a header of [optional back] · title · close.
 *
 * Kept mounted while closed so it can animate both ways; the stylesheet's
 * `visibility: hidden` is what removes it from the tab order meanwhile.
 */
export function SlidePanel({
  open,
  title,
  titleId,
  onClose,
  onBack,
  backLabel = 'Back',
  children,
}: SlidePanelProps) {
  const trapRef = useFocusTrap<HTMLDivElement>(open, onClose);

  return (
    <div
      ref={trapRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={`${styles.panel} ${open ? styles.open : ''}`}
    >
      <header className={styles.header}>
        {onBack && (
          <IconButton aria-label={backLabel} icon={<IconChevronLeft />} onClick={onBack} />
        )}
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <IconButton
          aria-label={`Close ${title.toLowerCase()}`}
          icon={<IconClose size={15} />}
          onClick={onClose}
        />
      </header>

      <div className={styles.body}>{children}</div>
    </div>
  );
}
