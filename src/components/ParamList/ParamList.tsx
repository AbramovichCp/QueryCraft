import { useEffect, useState } from 'react';
import type { QueryParam } from '@/types';
import { StackFrame } from '../JsonStack';
import type { FrameInfo } from '../JsonStack';
import { ParamRow } from '../ParamRow';
import { AddParamRow } from '../AddParamRow';
import styles from './ParamList.module.css';

interface ParamListProps {
  params: QueryParam[];
  onKeyChange: (id: string, key: string) => void;
  onValueChange: (id: string, value: string) => void;
  onToggleBoolean: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (key: string, value: string) => void;
}

export function ParamList({
  params,
  onKeyChange,
  onValueChange,
  onToggleBoolean,
  onRemove,
  onAdd,
}: ParamListProps) {
  const headingId = 'params-heading';
  const [frames, setFrames] = useState<FrameInfo[]>([]);
  const [viewMode, setViewMode] = useState<'structured' | 'raw'>('structured');

  // Keyboard: Esc pops one frame, Cmd/Ctrl+Backspace pops all
  useEffect(() => {
    if (frames.length === 0) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setFrames((prev) => (prev.length <= 1 ? [] : prev.slice(0, -1)));
      }
      if (e.key === 'Backspace' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setFrames([]);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [frames.length]);

  function handleExpand(paramId: string, paramKey: string) {
    setFrames([{ name: paramKey, path: [], paramId }]);
  }

  function pushFrame(frame: FrameInfo) {
    setFrames((prev) => [...prev, frame]);
  }

  function popFrame() {
    setFrames((prev) => (prev.length <= 1 ? [] : prev.slice(0, -1)));
  }

  function popAll() {
    setFrames([]);
  }

  function popTo(index: number) {
    setFrames((prev) => prev.slice(0, index + 1));
  }

  const showStack = frames.length > 0;

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.header}>
        <h2 id={headingId} className={styles.heading}>
          Parameters
        </h2>
        <span className={styles.count} aria-label={`${params.length} parameters`}>
          {params.length}
        </span>
      </div>

      {showStack ? (
        <StackFrame
          frames={frames}
          params={params}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onValueChange={onValueChange}
          onPop={popFrame}
          onPopAll={popAll}
          onPopTo={popTo}
          onPush={pushFrame}
        />
      ) : (
        <>
          <ul className={styles.list} role="list">
            {params.map((param) => (
              <ParamRow
                key={param.id}
                param={param}
                onKeyChange={onKeyChange}
                onValueChange={onValueChange}
                onToggleBoolean={onToggleBoolean}
                onRemove={onRemove}
                onExpand={
                  param.type === 'structured'
                    ? () => handleExpand(param.id, param.key)
                    : undefined
                }
              />
            ))}
          </ul>
          <AddParamRow onAdd={onAdd} />
        </>
      )}
    </section>
  );
}
