import { Button } from '../Button';
import { IconCheck, IconCopy, IconReset, IconSave } from '../icons';
import styles from './ActionBar.module.css';

interface ActionBarProps {
  onApply: () => void;
  onReset: () => void;
  onCopy: () => void;
  onSave: () => void;
  applyDisabled?: boolean;
  copied?: boolean;
}

/**
 * Bottom action bar. Layout follows the reference screenshot:
 *   [Apply] [Reset] ...................................... [Copy] [Save]
 *
 * Apply is the primary action (accent). Others are ghost. All buttons reach
 * the WCAG 2.2 minimum target size via the Button component's --min-target.
 */
export function ActionBar({
  onApply,
  onReset,
  onCopy,
  onSave,
  applyDisabled = false,
  copied = false,
}: ActionBarProps) {
  return (
    <div className={styles.root}>
      <div className={styles.primary}>
        <Button variant="primary" onClick={onApply} disabled={applyDisabled}>
          Apply
        </Button>
        <Button variant="ghost" onClick={onReset} leadingIcon={<IconReset />}>
          Reset
        </Button>
      </div>
      <div className={styles.secondary}>
        <Button
          variant="ghost"
          onClick={onCopy}
          leadingIcon={copied ? <IconCheck /> : <IconCopy />}
          aria-label={copied ? 'URL copied to clipboard' : 'Copy URL to clipboard'}
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button variant="ghost" onClick={onSave} leadingIcon={<IconSave />}>
          Save
        </Button>
      </div>
    </div>
  );
}
