import { css } from "lit";

export default css`
  :host {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    line-height: 1;
    user-select: none;
    color: var(--app-text);
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid;
    font-weight: 600;
    letter-spacing: 0.2px;
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    position: relative;
  }

  @keyframes dotPulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.08);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes dotRipple {
    0% {
      opacity: 0.35;
      transform: translate(-50%, -50%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(2.6);
    }
  }

  .pill[data-state="connected"] .dot,
  .pill[data-state="connecting"] .dot,
  .pill[data-state="reconnecting"] .dot {
    animation: dotPulse 1.1s ease-in-out infinite;
  }

  .pill[data-state="connected"] .dot::after,
  .pill[data-state="connecting"] .dot::after,
  .pill[data-state="reconnecting"] .dot::after {
    content: "";
    position: absolute;
    left: 50%;
    top: 50%;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 1px solid currentColor;
    transform: translate(-50%, -50%);
    opacity: 0;
    animation: dotRipple 1.6s ease-out infinite;
  }

  .pill[data-state="connected"] {
    color: var(--status-connected-fg);
    background: var(--status-connected-bg);
    border-color: var(--status-connected-border);
  }
  .pill[data-state="connected"] .dot {
    background: var(--status-connected-dot);
    box-shadow: 0 0 0 2px var(--status-connected-ring);
  }

  .pill[data-state="connecting"] {
    color: var(--status-connecting-fg);
    background: var(--status-connecting-bg);
    border-color: var(--status-connecting-border);
  }
  .pill[data-state="connecting"] .dot {
    background: var(--status-connecting-dot);
    box-shadow: 0 0 0 2px var(--status-connecting-ring);
  }

  .pill[data-state="reconnecting"] {
    color: var(--status-reconnecting-fg);
    background: var(--status-reconnecting-bg);
    border-color: var(--status-reconnecting-border);
  }
  .pill[data-state="reconnecting"] .dot {
    background: var(--status-reconnecting-dot);
    box-shadow: 0 0 0 2px var(--status-reconnecting-ring);
  }

  .pill[data-state="disconnected"] {
    color: var(--status-disconnected-fg);
    background: var(--status-disconnected-bg);
    border-color: var(--status-disconnected-border);
  }
  .pill[data-state="disconnected"] .dot {
    background: var(--status-disconnected-dot);
    box-shadow: 0 0 0 2px var(--status-disconnected-ring);
  }

  @media (prefers-reduced-motion: reduce) {
    .pill[data-state="connected"] .dot,
    .pill[data-state="connecting"] .dot,
    .pill[data-state="reconnecting"] .dot {
      animation: none;
    }
    .pill[data-state="connected"] .dot::after,
    .pill[data-state="connecting"] .dot::after,
    .pill[data-state="reconnecting"] .dot::after {
      animation: none;
      display: none;
    }
  }

  .meta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
`;
