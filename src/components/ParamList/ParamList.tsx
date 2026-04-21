import { useEffect, useState } from 'react';
import type { QueryParam, DslPreset } from '@/types';
import { findMatchingPreset, looksLikeDsl } from '@/lib/dslParser';
import { StackFrame } from '../JsonStack';
import type { FrameInfo } from '../JsonStack';
import { DslEditorPanel } from '../DslEditorPanel';
import { ParamRow } from '../ParamRow';
import { AddParamRow } from '../AddParamRow';
import styles from './ParamList.module.css';

interface ParamListProps {
  params: QueryParam[];
  presets: DslPreset[];
  onKeyChange: (id: string, key: string) => void;
  onValueChange: (id: string, value: string) => void;
  onToggleBoolean: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (key: string, value: string) => void;
}

export function ParamList({
  params,
  presets,
  onKeyChange,
  onValueChange,
  onToggleBoolean,
  onRemove,
  onAdd,
}: ParamListProps) {
  const headingId = 'params-heading';
  const [frames, setFrames] = useState<FrameInfo[]>([]);
  const [viewMode, setViewMode] = useState<'structured' | 'raw'>('structured');

  // DSL panel state
  const [dslParamId, setDslParamId] = useState<string | null>(null);
  const [dslViewMode, setDslViewMode] = useState<'structured' | 'raw'>('structured');

  // Keyboard: Esc closes DSL panel or JSON frame
  useEffect(() => {
    const hasOverlay = frames.length > 0 || dslParamId !== null;
    if (!hasOverlay) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (frames.length > 0) {
          setFrames((prev) => (prev.length <= 1 ? [] : prev.slice(0, -1)));
        } else if (dslParamId !== null) {
          setDslParamId(null);
        }
      }
      if (e.key === 'Backspace' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setFrames([]);
        setDslParamId(null);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [frames.length, dslParamId]);

  function handleExpand(paramId: string, paramKey: string) {
    setDslParamId(null);
    setFrames([{ name: paramKey, path: [], paramId }]);
  }

  function handleExpandDsl(paramId: string) {
    setFrames([]);
    setDslParamId(paramId);
    setDslViewMode('structured');
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
  const showDsl = !showStack && dslParamId !== null;
  const dslParam = showDsl ? params.find((p) => p.id === dslParamId) : null;

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
      ) : showDsl && dslParam ? (
        <DslEditorPanel
          key={dslParamId}
          paramKey={dslParam.key}
          value={dslParam.value}
          viewMode={dslViewMode}
          onViewModeChange={setDslViewMode}
          onChange={(newVal) => onValueChange(dslParam.id, newVal)}
          onClose={() => setDslParamId(null)}
        />
      ) : (
        <>
          <ul className={styles.list} role="list">
            {params.map((param) => {
              const matchedPreset = findMatchingPreset(param.key, presets);
              const isDsl = matchedPreset !== null && looksLikeDsl(param.value);
              return (
                <ParamRow
                  key={param.id}
                  param={param}
                  onKeyChange={onKeyChange}
                  onValueChange={onValueChange}
                  onToggleBoolean={onToggleBoolean}
                  onRemove={onRemove}
                  isDsl={isDsl}
                  onExpandDsl={isDsl ? () => handleExpandDsl(param.id) : undefined}
                  onExpand={
                    param.type === 'structured' && !isDsl
                      ? () => handleExpand(param.id, param.key)
                      : undefined
                  }
                />
              );
            })}
          </ul>
          <AddParamRow onAdd={onAdd} />
        </>
      )}
    </section>
  );
}
