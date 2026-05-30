import { css } from "lit";

export default css`
  :host {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    pointer-events: none;
  }

  .drawer {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 16px;
    border: 1px solid var(--app-border);
    border-top: none;
    border-radius: 0 0 16px 16px;
    background: var(--app-surface);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
    cursor: pointer;
    pointer-events: auto;
    /* Slide in/out from the top. */
    transform: translateY(-110%);
    opacity: 0;
    transition:
      transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity 220ms ease;
  }

  .drawer.open {
    transform: translateY(0);
    opacity: 1;
  }

  .drawer:hover.open {
    background: var(--app-hover, var(--app-surface));
  }

  .pulse {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--status-connected-dot, #22c55e);
    box-shadow: 0 0 0 0 var(--status-connected-ring, rgba(34, 197, 94, 0.5));
    animation: call-pulse 1.8s ease-out infinite;
    flex: 0 0 auto;
  }

  @keyframes call-pulse {
    0% {
      box-shadow: 0 0 0 0 var(--status-connected-ring, rgba(34, 197, 94, 0.5));
    }
    70% {
      box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
    }
  }

  .info {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
    max-width: 220px;
  }

  .label {
    font-size: 11px;
    color: var(--app-muted);
  }

  .title {
    font-size: 14px;
    color: var(--app-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .badge {
    width: 26px;
    height: 26px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid var(--app-border);
  }

  .badge.on {
    background: color-mix(in oklab, var(--status-connected-dot, #22c55e) 22%, var(--app-surface));
    color: var(--status-connected-dot, #22c55e);
  }

  .badge.off {
    background: color-mix(in oklab, var(--app-danger) 22%, var(--app-surface));
    color: var(--app-danger);
  }

  .cta {
    font-size: 12px;
    font-weight: 600;
    color: var(--app-link);
  }

  @media (prefers-reduced-motion: reduce) {
    .drawer {
      transition: none;
    }
    .pulse {
      animation: none;
    }
  }
`;
