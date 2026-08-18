import { Button } from '../Button';
import { IconBookmark, IconCheck, IconCopy, IconReset } from '../icons';
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
 * Bottom action bar:
 *   [Apply] [Reset] ...................................... [Copy] [Save]
 *
 * Apply is the primary (filled) action; the rest are outlined.
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
      <Button
        variant="primary"
        onClick={onApply}
        disabled={applyDisabled}
        leadingIcon={<IconCheck />}
      >
        Apply
      </Button>
      <Button variant="ghost" size="sm" onClick={onReset} leadingIcon={<IconReset />}>
        Reset
      </Button>

      <div className={styles.spacer} />

      <Button
        variant="ghost"
        size="sm"
        onClick={onCopy}
        leadingIcon={copied ? <IconCheck /> : <IconCopy />}
        aria-label={copied ? 'URL copied to clipboard' : 'Copy URL to clipboard'}
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>
      <Button variant="ghost" size="sm" onClick={onSave} leadingIcon={<IconBookmark />}>
        Save
      </Button>
    </div>
  );
}
