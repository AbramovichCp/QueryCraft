import { useMemo } from 'react';
import type { ParsedUrl } from '@/types';
import styles from './UrlPreview.module.css';

interface UrlPreviewProps {
  parsed: ParsedUrl;
}

interface Token {
  kind: 'base' | 'separator' | 'key' | 'value';
  text: string;
  id: string;
}

/**
 * Tokenizes the parsed URL for display. We can't reuse serializeUrl directly
 * because we want fine-grained control over each fragment's styling.
 *
 * Percent-encoding note: we display keys verbatim (as the user typed them) but
 * we display values verbatim too — we do NOT re-encode here, because the point
 * of the preview is to show what's currently in the editor, not what will be
 * sent to the network. Encoding is only applied on Apply.
 */
function tokenize(parsed: ParsedUrl): Token[] {
  const tokens: Token[] = [{ kind: 'base', text: parsed.base, id: 'base' }];
  parsed.params.forEach((p, i) => {
    tokens.push({ kind: 'separator', text: i === 0 ? '?' : '&', id: `sep-${p.id}` });
    tokens.push({ kind: 'key', text: p.key || '(empty)', id: `k-${p.id}` });
    tokens.push({ kind: 'separator', text: '=', id: `eq-${p.id}` });
    tokens.push({ kind: 'value', text: p.value, id: `v-${p.id}` });
  });
  if (parsed.fragment) {
    tokens.push({ kind: 'separator', text: parsed.fragment, id: 'frag' });
  }
  return tokens;
}

export function UrlPreview({ parsed }: UrlPreviewProps) {
  const tokens = useMemo(() => tokenize(parsed), [parsed]);

  return (
    <section
      aria-label="Preview of current URL with highlighted query parameter keys"
      className={styles.root}
    >
      <div className={styles.text}>
        {tokens.map((t) => (
          <span key={t.id} className={styles[t.kind]}>
            {t.text}
          </span>
        ))}
      </div>
    </section>
  );
}
