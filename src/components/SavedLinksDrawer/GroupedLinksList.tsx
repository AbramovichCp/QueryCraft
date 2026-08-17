import { useState } from 'react';
import type { Group, SavedLink } from '@/types';
import { Button } from '../Button';
import { IconButton } from '../IconButton';
import { IconChevronLeft, IconClose, IconEdit } from '../icons';
import styles from './SavedLinksDrawer.module.css';

interface GroupedLinksListProps {
  groups: Group[];
  linksByGroup: Map<string, SavedLink[]>;
  onLoadLink: (url: string) => void;
  onDeleteLink: (id: string) => void;
  onStartEdit: (link: SavedLink) => void;
  onStartSave: () => void;
  canSave: boolean;
}

/** The default drawer view: saved links grouped into collapsible sections. */
export function GroupedLinksList({
  groups,
  linksByGroup,
  onLoadLink,
  onDeleteLink,
  onStartEdit,
  onStartSave,
  canSave,
}: GroupedLinksListProps) {
  const totalCount = Array.from(linksByGroup.values()).reduce((sum, l) => sum + l.length, 0);

  // All groups expanded by default.
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set());

  function toggleGroup(id: string) {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className={styles.list}>
      <div className={styles.listTop}>
        <Button variant="primary" size="sm" onClick={onStartSave} block disabled={!canSave}>
          Save current URL
        </Button>
      </div>

      {totalCount === 0 ? (
        <p className={styles.empty}>No saved URLs yet. Save the current URL to get started.</p>
      ) : (
        groups.map((g) => {
          const groupLinks = linksByGroup.get(g.id) ?? [];
          if (groupLinks.length === 0) return null;
          const isExpanded = !collapsedGroups.has(g.id);
          return (
            <section key={g.id} className={styles.groupSection} aria-labelledby={`g-${g.id}`}>
              <button
                type="button"
                id={`g-${g.id}`}
                className={styles.groupToggle}
                onClick={() => toggleGroup(g.id)}
                aria-expanded={isExpanded}
              >
                <span className={styles.groupName}>
                  {g.name}
                  <span className={styles.groupCount} aria-label={`${groupLinks.length} links`}>
                    {groupLinks.length}
                  </span>
                </span>
                <span
                  className={`${styles.chevron} ${isExpanded ? '' : styles.chevronCollapsed}`}
                  aria-hidden="true"
                >
                  <IconChevronLeft />
                </span>
              </button>
              {isExpanded && (
                <ul className={styles.linkList}>
                  {groupLinks.map((link) => (
                    <li key={link.id} className={styles.linkRow}>
                      <button
                        type="button"
                        className={styles.linkButton}
                        onClick={() => onLoadLink(link.url)}
                        title={link.url}
                      >
                        <span className={styles.linkLabel}>{link.label || link.url}</span>
                        {link.label && <span className={styles.linkUrl}>{link.url}</span>}
                      </button>
                      <div className={styles.linkActions}>
                        <IconButton
                          aria-label={`Edit ${link.label || link.url}`}
                          icon={<IconEdit />}
                          size="sm"
                          onClick={() => onStartEdit(link)}
                        />
                        <IconButton
                          aria-label={`Delete ${link.label || link.url}`}
                          icon={<IconClose />}
                          size="sm"
                          tone="danger"
                          onClick={() => onDeleteLink(link.id)}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
