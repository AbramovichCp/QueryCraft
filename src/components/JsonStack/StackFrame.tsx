import type { QueryParam } from '@/types';
import {
  parseStructuredValue,
  serializeStructuredValue,
  getAtPath,
  setAtPath,
  renameKeyAtPath,
} from '@/lib/structuredParam';
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

  if (!param) return null;

  let rootValue: unknown;
  try {
    rootValue = parseStructuredValue(param.value);
  } catch {
    return null;
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
          <button className={styles.crumbRoot} onClick={onPopAll}>
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
                  <button className={styles.crumbAncestor} onClick={() => onPopTo(i)}>
                    {f.name}
                  </button>
                )}
              </span>
            );
          })}
        </nav>

        <div className={styles.toggle} role="group" aria-label="View mode">
          <button
            className={`${styles.toggleBtn} ${viewMode === 'structured' ? styles.toggleActive : ''}`}
            onClick={() => onViewModeChange('structured')}
          >
            Structured
          </button>
          <button
            className={`${styles.toggleBtn} ${viewMode === 'raw' ? styles.toggleActive : ''}`}
            onClick={() => onViewModeChange('raw')}
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
        <button className={styles.backBtn} onClick={onPop} aria-label="Go back one level">
          ← Back
        </button>
      </div>
    </div>
  );
}
