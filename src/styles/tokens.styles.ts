import { css } from "lit";

/**
 * Shared design tokens.
 *
 * Applied on the `app-router` host (which carries the `data-theme` attribute),
 * so every component rendered inside its shadow tree inherits these custom
 * properties. The light-theme block overrides the dark defaults.
 */
export const tokens = css`
  :host {
    /* Dark theme tokens (aligned with app-logs) */
    color-scheme: dark;
    --app-bg: #0f172a;
    --app-surface: #1e293b;
    --app-surface-2: #0b1220;
    --app-border: #334155;
    --app-text: #e5e7eb;
    --app-muted: #94a3b8;
    --app-link: #93c5fd;
    --app-focus: rgba(147, 197, 253, 0.35);
    --app-hover: rgba(148, 163, 184, 0.12);

    /* Shared component tokens */
    --ui-button-bg: #3b82f6;
    --ui-button-bg-hover: #2563eb;
    --ui-button-fg: #ffffff;

    /* Signal strength (theme-independent) */
    --signal-off: #64748b;
    --signal-disconnected: #ef4444;
    --signal-bad: #ef4444;
    --signal-poor: #f97316;
    --signal-ok: #f59e0b;
    --signal-good: #22c55e;

    /* Connection status (dark theme defaults) */
    --status-connected-fg: #86efac;
    --status-connected-bg: rgba(34, 197, 94, 0.14);
    --status-connected-border: rgba(34, 197, 94, 0.35);
    --status-connected-dot: #22c55e;
    --status-connected-ring: rgba(34, 197, 94, 0.15);

    --status-connecting-fg: #fde68a;
    --status-connecting-bg: rgba(245, 158, 11, 0.14);
    --status-connecting-border: rgba(245, 158, 11, 0.35);
    --status-connecting-dot: #f59e0b;
    --status-connecting-ring: rgba(245, 158, 11, 0.15);

    --status-disconnected-fg: #fecaca;
    --status-disconnected-bg: rgba(239, 68, 68, 0.14);
    --status-disconnected-border: rgba(239, 68, 68, 0.35);
    --status-disconnected-dot: #ef4444;
    --status-disconnected-ring: rgba(239, 68, 68, 0.15);

    /* Reconnecting reuses the connecting palette (resolves per-theme) */
    --status-reconnecting-fg: var(--status-connecting-fg);
    --status-reconnecting-bg: var(--status-connecting-bg);
    --status-reconnecting-border: var(--status-connecting-border);
    --status-reconnecting-dot: var(--status-connecting-dot);
    --status-reconnecting-ring: var(--status-connecting-ring);
  }

  :host([data-theme="light"]) {
    color-scheme: light;
    --app-bg: #f8fafc;
    --app-surface: #ffffff;
    --app-surface-2: #ffffff;
    --app-border: #e5e7eb;
    --app-text: #0f172a;
    --app-muted: #64748b;
    --app-link: #2563eb;
    --app-focus: rgba(59, 130, 246, 0.25);
    --app-hover: rgba(15, 23, 42, 0.06);

    --signal-off: #cbd5e1;

    /* Connection status (light theme overrides for contrast) */
    --status-connected-fg: #166534;
    --status-connected-bg: #dcfce7;
    --status-connected-border: #86efac;
    --status-connected-dot: #16a34a;
    --status-connected-ring: rgba(22, 163, 74, 0.2);

    --status-connecting-fg: #92400e;
    --status-connecting-bg: #ffedd5;
    --status-connecting-border: #fdba74;
    --status-connecting-dot: #f59e0b;
    --status-connecting-ring: rgba(245, 158, 11, 0.18);

    --status-disconnected-fg: #7f1d1d;
    --status-disconnected-bg: #fee2e2;
    --status-disconnected-border: #fca5a5;
    --status-disconnected-dot: #ef4444;
    --status-disconnected-ring: rgba(239, 68, 68, 0.18);
  }
`;
