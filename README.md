# QueryCraft

A Chrome extension for inspecting, editing, saving, and replaying URL query parameters on the active tab. Built for developers and QA engineers.

**[Install from the Chrome Web Store](https://chromewebstore.google.com/detail/querycraft/gokkgpehjnmdcnpknmkefbjnhpnnhbih)**

![QueryCraft popup](public/icons/icon128.png)

## Features

- **Live parameter editor** — parses the active tab's URL, shows each query param as an editable row, with one-click navigation to the edited URL.
- **Type-aware inputs** — `true` / `false` values render as a toggle switch next to the literal value (original casing preserved, so `TRUE` toggles to `FALSE`); JSON objects and arrays get a drill-down editor; everything else is a monospace text field.
- **Filter parameters** — live substring search over parameter keys, for URLs with dozens of params.
- **Highlighted URL preview** — full URL shown at the top with parameter keys emphasized and separators muted; editable directly.
- **Structured JSON editing** — drill into nested objects and arrays with a breadcrumb stack, or edit the raw JSON.
- **Save & group** — persist URLs into named groups (stored locally via `chrome.storage.local`), reload them into the editor with one click.
- **Copy / Apply / Reset** — copy the current URL, replace the active tab's URL, or snap back to the URL that was open when the popup first loaded.
- **Accent color** — Settings offers ten accent swatches that tint the logo, parameter badge, URL keys, toggles and primary buttons; "Reset to monochrome" returns to the base look. Persisted locally.
- **Follows your system appearance** — light and dark switch with the OS, live. There is no theme setting to get out of sync.
- **Full keyboard navigation** — every interactive element is reachable via Tab, with visible focus rings and sensible shortcuts.
- **Screen-reader friendly** — semantic HTML, a single ARIA live region (the toast doubles as it, so nothing is announced twice), role-correct toggle/switch/radiogroup/dialog semantics.

## Planned features

- **Company-specific query filter rules** — support for complex, configurable filters tailored to the needs of individual companies. The configuration delivery mechanism is still being explored (inline config, file import, or remote fetch). Currently available as a **beta** on the [`DLS-beta`](../../tree/DLS-beta) branch — build it yourself to try it out.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Enter` in a row field | Commit / advance focus |
| `Cmd`/`Ctrl` + `Enter` | Apply edited URL to the active tab |
| `Cmd`/`Ctrl` + `S` | Open the saved URLs drawer |
| `Esc` | Close the open panel / step one level out of an expanded JSON value |
| `Space` on a `BOOL` toggle | Flip the value |

## Tech stack

- **Manifest V3** (service worker, `action`, minimal permissions)
- **React 18** with TypeScript (strict mode)
- **Vite** + `@crxjs/vite-plugin` for HMR during popup development
- **Zustand** for state (small footprint, test-friendly)
- **CSS Modules** + CSS custom properties for theming, with an `oklch` monochrome token set in `src/styles/tokens.css`
- **Vitest** + React Testing Library (unit tests cover URL parsing, param typing, structured values, storage, and the store)

## Permissions

The extension requests only what it needs:

| Permission | Why |
| --- | --- |
| `activeTab` | Read and update the URL of the currently focused tab (granted per user gesture — no standing access to browsing history) |
| `storage` | Persist saved links, groups, and the accent color locally |

No `<all_urls>`, no `clipboardWrite` (popups are secure contexts and a user-gesture click is enough for `navigator.clipboard.writeText`).

## Development

### Prerequisites

- Node.js 20+
- npm 10+ (or pnpm / yarn if you prefer)

### Install

```bash
npm install
```

### Run in development

```bash
npm run dev
```

This starts Vite with the `@crxjs` plugin, which rebuilds on save and writes the unpacked extension into `dist/`.

### Load into Chrome

1. Open `chrome://extensions`.
2. Toggle **Developer mode** (top-right).
3. Click **Load unpacked** and select the `dist/` folder.
4. Click the QueryCraft icon in the toolbar on any `http`/`https` page.

### Production build

```bash
npm run build
```

The production build lands in `dist/`, ready to be zipped and uploaded to the Chrome Web Store.

### Type check / lint / test

```bash
npm run build       # runs `tsc --noEmit` before Vite
npm run lint        # ESLint with react + jsx-a11y rules
npm run test        # Vitest (jsdom, with chrome.* mocks preconfigured)
```

## Deployment

Releases are automated via GitHub Actions and publish directly to the Chrome Web Store.

### How it works

| Trigger | What happens |
| --- | --- |
| PR merged into `release` branch | Automatic deploy |
| Manual `workflow_dispatch` | Deploy with a chosen version bump |

### Version bumping

The workflow bumps `manifest.json` version automatically before building:

| Type | Example |
| --- | --- |
| `patch` (default) | `1.0.0` → `1.0.1` |
| `minor` | `1.0.0` → `1.1.0` |
| `major` | `1.0.0` → `2.0.0` |

### Required secrets

The following secrets must be set in the repository settings:

| Secret | Description |
| --- | --- |
| `EXTENSION_ID` | Chrome Web Store extension ID |
| `CLIENT_ID` | Google OAuth client ID |
| `CLIENT_SECRET` | Google OAuth client secret |
| `REFRESH_TOKEN` | Google OAuth refresh token |

### Release flow

1. Merge your feature branch into `main`.
2. Open a PR from `main` → `release`.
3. Merge the PR — the workflow bumps the version, builds, zips, uploads to the store, and tags the release automatically.

## Design system

The UI follows a monochrome, Linear-inspired design (see `src/styles/tokens.css`).

| Aspect | Value |
| --- | --- |
| Popup size | 380 × 600 px |
| Palette | `oklch` with zero chroma — hierarchy from lightness, border alpha, and weight |
| Radii | 6–7px controls · 8px larger inputs · 10px cards · 20px pills |
| Type | Inter (UI) · JetBrains Mono (URLs and values) |
| Icons | Inline Feather/Lucide-style outlines: 24-unit viewBox, 2px stroke, round caps |

Three deliberate deviations from the design handoff:

- **Height is 600px, not 640px.** Chrome hard-caps extension popups at 800 × 600; a 640px panel is simply clipped. The layout is a flex column with a scrolling middle band, so it renders faithfully at 600.
- **Reset does not open a `window.confirm()` dialog.** Modal JS dialogs are suppressed inside MV3 extension popups, so the confirmation would never appear and Reset would silently do nothing. The handoff lists this as a tweakable behavior; it is off.
- **Accent labels are not fixed to near-white.** The handoff specifies `#FAFAFA` text on the accent-colored buttons, but every swatch in the palette fails WCAG AA that way — from 3.4:1 (Violet) down to 2.2:1 (Lime), against a 4.5:1 requirement for 13px text. The label color is therefore chosen per swatch by luminance, and accent-as-text (logo, badge, URL keys) is darkened or lightened just enough to clear 4.5:1 on the current panel. Solid fills keep the exact swatch the user picked, so a button always matches its swatch. See `src/lib/contrast.ts`.

Fonts are referenced by family name and fall back to the system stack — the extension ships no webfonts, because the MV3 content security policy blocks remote font CDNs. To match the reference typography exactly, self-host the Inter and JetBrains Mono `woff2` files under `public/` and add an `@font-face` block.

## Accessibility notes

- Interactive controls are ≥ 24×24 CSS px (WCAG 2.2 SC 2.5.8 minimum), with header and footer actions at 28px and larger.
- The reference design signals focus only by lightening an input border. That is kept, and a `:focus-visible` outline is layered on top so keyboard users get a real indicator; `outline: none` is never used without a replacement.
- Every input has a `<label>` (visible or `.visually-hidden`), never bare placeholders as labels.
- The drawer uses `role="dialog"`, `aria-modal="true"`, and a focus trap that restores focus to the trigger on close. While closed it is `visibility: hidden`, which keeps it out of both the tab order and the accessibility tree.
- Status changes (URL applied, copied, saved, reset, param added/removed) are announced via a single polite `aria-live` region — the visible toast *is* that region, so nothing is announced twice.
- `prefers-reduced-motion` is honored globally — animations collapse to a near-instant transition.
- Color is never the sole channel for status: the boolean switch always renders its literal value next to it, and destructive actions pair tone with an icon and label.
- `color-scheme` is declared per theme so Chrome does not apply its own auto-dark-mode inversion to form controls, and native scrollbars and select popups match the theme.

## Testability

- `chrome.*` APIs are accessed only through adapters in `src/lib/storage.ts` and `src/lib/tabs.ts`, so tests can swap a single module instead of the global `chrome` namespace.
- URL parsing lives in pure functions (`parseUrl`, `serializeUrl`, `isEditableUrl`, `createParam`) with no React or Chrome dependencies.
- Components accept behavior via props, not singletons, so they can be rendered in isolation with a test harness.
- `src/test/setup.ts` ships with `chrome.storage.local`, `chrome.tabs`, `navigator.clipboard`, and `matchMedia` mocks preconfigured.

## License

MIT
