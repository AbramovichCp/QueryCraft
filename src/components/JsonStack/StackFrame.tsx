import type { QueryParam } from '@/types';
import {
  tryParseStructured,
  serializeStructuredValue,
  getAtPath,
  setAtPath,
  renameKeyAtPath,
} from '@/lib/structuredParam';
import { Button } from '../Button';
import { IconChevronLeft } from '../icons';
import { JsonTree } from './JsonTree';
import { RawJsonEditor } from './RawJsonEditor';
import styles from './StackFrame.module.css';

export interface FrameInfo {
  name: string;
  path: (string | number)[];
  paramId: string;
}

interface StackFrameProps {
  frames: FrameInfo[];
  params: QueryParam[];
  viewMode: 'structured' | 'raw';
  onViewModeChange: (mode: 'structured' | 'raw') => void;
  onValueChange: (id: string, value: string) => void;
  onPop: () => void;
  onPopAll: () => void;
  onPopTo: (index: number) => void;
  onPush: (frame: FrameInfo) => void;
}

export function StackFrame({
  frames,
  params,
  viewMode,
  onViewModeChange,
  onValueChange,
  onPop,
  onPopAll,
  onPopTo,
  onPush,
}: StackFrameProps) {
  const currentFrame = frames[frames.length - 1];
  const param = params.find((p) => p.id === currentFrame.paramId);
  const rootValue = param === undefined ? undefined : tryParseStructured(param.value);

  // The param was removed or its value stopped being valid JSON while the
  // stack was open — offer a way back instead of a dead blank panel.
  if (rootValue === undefined) {
    return (
      <div className={styles.frame}>
        <div className={styles.body}>
          <p className={styles.missing}>This value is no longer available.</p>
        </div>
        <div className={styles.footer}>
          <Button variant="ghost" onClick={onPopAll} leadingIcon={<IconChevronLeft />}>
            Back to parameters
          </Button>
        </div>
      </div>
    );
  }

  const frameValue = getAtPath(rootValue, currentFrame.path);

  function handleLeafChange(key: string | number, newLeafValue: unknown) {
    const leafPath = [...currentFrame.path, key];
    const newRoot = setAtPath(rootValue, leafPath, newLeafValue);
    onValueChange(currentFrame.paramId, serializeStructuredValue(newRoot));
  }

  function handlePush(key: string | number) {
    const childPath = [...currentFrame.path, key];
    const name = typeof key === 'number' ? `[${key}]` : String(key);
    onPush({ name, path: childPath, paramId: currentFrame.paramId });
  }

  function handleKeyChange(oldKey: string, newKey: string) {
    const newRoot = renameKeyAtPath(rootValue, currentFrame.path, oldKey, newKey);
    onValueChange(currentFrame.paramId, serializeStructuredValue(newRoot));
  }

  function handleRawChange(newValue: unknown) {
    const newRoot = setAtPath(rootValue, currentFrame.path, newValue);
    onValueChange(currentFrame.paramId, serializeStructuredValue(newRoot));
  }

  const frameKey = `${currentFrame.paramId}/${currentFrame.path.join('/')}`;

  return (
    <div className={styles.frame}>
      {/* Breadcrumb + Structured/Raw toggle */}
      <div className={styles.topBar}>
        <nav className={styles.breadcrumb} aria-label="JSON path">
          <button type="button" className={styles.crumb} onClick={onPopAll}>
            params
          </button>
          {frames.map((f, i) => {
            const isCurrent = i === frames.length - 1;
            return (
              <span key={i} className={styles.crumbGroup}>
                <span className={styles.crumbSep}>/</span>
                {isCurrent ? (
                  <span className={styles.crumbCurrent}>{f.name}</span>
                ) : (
                  <button type="button" className={styles.crumb} onClick={() => onPopTo(i)}>
                    {f.name}
                  </button>
                )}
              </span>
            );
          })}
        </nav>

        <div className={styles.toggle} role="group" aria-label="View mode">
          <button
            type="button"
            className={`${styles.toggleBtn} ${viewMode === 'structured' ? styles.toggleActive : ''}`}
            onClick={() => onViewModeChange('structured')}
            aria-pressed={viewMode === 'structured'}
          >
            Structured
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${viewMode === 'raw' ? styles.toggleActive : ''}`}
            onClick={() => onViewModeChange('raw')}
            aria-pressed={viewMode === 'raw'}
          >
            Raw JSON
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={styles.body}>
        {viewMode === 'structured' ? (
          <JsonTree
            key={frameKey}
            value={frameValue}
            onPush={handlePush}
            onLeafChange={handleLeafChange}
            onKeyChange={handleKeyChange}
          />
        ) : (
          <RawJsonEditor
            key={frameKey}
            value={frameValue}
            onChange={handleRawChange}
          />
        )}
      </div>

      {/* Back button */}
      <div className={styles.footer}>
        <Button
          variant="ghost"
          onClick={onPop}
          leadingIcon={<IconChevronLeft />}
          aria-label="Go back one level"
        >
          Back
        </Button>
      </div>
    </div>
  );
}
