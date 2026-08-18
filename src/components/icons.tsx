/**
 * Inline SVG icons — no external dependency, tree-shakeable, themable via `currentColor`.
 *
 * Feather/Lucide-style outline set per the redesign: 24-unit viewBox, 2px
 * stroke, round caps and joins. Size defaults to 14px (header/footer scale);
 * pass `size` for the 13px in-row scale.
 */

interface IconProps {
  /** Rendered width/height in px. */
  size?: number;
}

function icon(path: React.ReactNode, defaultSize = 14) {
  return function Icon({ size = defaultSize }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        {path}
      </svg>
    );
  };
}

export const IconClose = icon(<path d="M18 6L6 18M6 6l12 12" />, 13);

export const IconPlus = icon(<path d="M12 5v14M5 12h14" />);

export const IconCheck = icon(<path d="M20 6L9 17l-5-5" />, 13);

export const IconReset = icon(<path d="M3 12a9 9 0 1 0 3-6.7M3 3v6h6" />, 13);

export const IconCopy = icon(
  <>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </>,
  13,
);

export const IconBookmark = icon(<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />);

export const IconSearch = icon(
  <>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </>,
);

export const IconChevronLeft = icon(<path d="M15 18l-6-6 6-6" />, 15);

export const IconChevronDown = icon(<path d="M6 9l6 6 6-6" />);

export const IconChevronRight = icon(<path d="M9 18l6-6-6-6" />, 12);

/**
 * Circular arrows — "load this saved URL back into the editor".
 * Uses the standard refresh-cw geometry rather than the reference's hand-drawn
 * path, which collapsed into an illegible squiggle at 13px.
 */
export const IconLoad = icon(
  <>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M3 21v-5h5" />
  </>,
  13,
);

export const IconEdit = icon(
  <>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
  </>,
  13,
);

export const IconSettings = icon(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </>,
);
