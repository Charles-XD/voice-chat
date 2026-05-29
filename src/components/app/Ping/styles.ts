import { css } from "lit";

export default css`
  :host {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .signal {
    display: inline-flex;
    align-items: flex-end;
    gap: 2px;
    height: 14px;
  }

  .bar {
    width: 3px;
    border-radius: 2px;
    background: var(--signal-off);
    opacity: 0.35;
  }

  .bar:nth-child(1) {
    height: 4px;
  }
  .bar:nth-child(2) {
    height: 7px;
  }
  .bar:nth-child(3) {
    height: 10px;
  }
  .bar:nth-child(4) {
    height: 13px;
  }

  .signal[data-bars="0"] .bar {
    background: var(--signal-disconnected);
    opacity: 0.6;
  }

  .signal[data-bars="1"] .bar:nth-child(-n + 1),
  .signal[data-bars="2"] .bar:nth-child(-n + 2),
  .signal[data-bars="3"] .bar:nth-child(-n + 3),
  .signal[data-bars="4"] .bar:nth-child(-n + 4) {
    opacity: 1;
  }

  .signal[data-quality="bad"] .bar {
    background: var(--signal-bad);
  }
  .signal[data-quality="poor"] .bar {
    background: var(--signal-poor);
  }
  .signal[data-quality="ok"] .bar {
    background: var(--signal-ok);
  }
  .signal[data-quality="good"] .bar {
    background: var(--signal-good);
  }

  .ms {
    color: var(--app-muted);
    font-size: 12px;
  }
`;
