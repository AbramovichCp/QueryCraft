import type { QueryParam } from '@/types';
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

      <ul className={styles.list} role="list">
        {params.map((param) => (
          <ParamRow
            key={param.id}
            param={param}
            onKeyChange={onKeyChange}
            onValueChange={onValueChange}
            onToggleBoolean={onToggleBoolean}
            onRemove={onRemove}
          />
        ))}
      </ul>

      <AddParamRow onAdd={onAdd} />
    </section>
  );
}
