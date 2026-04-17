import { IconButton } from '../IconButton';
import { IconClose } from '../icons';

interface RemoveParamButtonProps {
  paramKey: string;
  onRemove: () => void;
}

export function RemoveParamButton({ paramKey, onRemove }: RemoveParamButtonProps) {
  const label = paramKey ? `Remove parameter ${paramKey}` : 'Remove empty parameter';
  return (
    <IconButton
      aria-label={label}
      icon={<IconClose />}
      tone="danger"
      size="sm"
      onClick={onRemove}
    />
  );
}
