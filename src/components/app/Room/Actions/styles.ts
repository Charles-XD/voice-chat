import { css } from "lit";

export default css`
  :host {
    display: block;
  }

  .bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid var(--app-border);
    background: var(--app-surface);
  }

  /* Push the leave button to the far right. */
  .bar ui-button[color="error"] {
    margin-left: auto;
  }

  ui-button svg {
    display: block;
  }
`;
