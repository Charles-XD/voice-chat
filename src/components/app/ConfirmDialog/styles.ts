import { css } from "lit";

export default css`
  :host {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 16px;
    font-family: var(--app-font, Consolas, monaco, monospace);
    color: var(--app-text);
  }

  :host([open]) {
    display: flex;
  }

  .backdrop {
    position: absolute;
    inset: 0;
    border: 0;
    padding: 0;
    background: color-mix(in oklab, var(--app-bg) 40%, transparent);
    cursor: pointer;
  }

  .dialog {
    position: relative;
    z-index: 1;
    width: min(100%, 400px);
    padding: 20px;
    border-radius: 14px;
    border: 1px solid var(--app-border);
    background: var(--app-surface);
    box-shadow: 0 16px 48px color-mix(in oklab, #000 40%, transparent);
  }

  .title {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 600;
    color: var(--app-text);
  }

  .message {
    margin: 0 0 20px;
    font-size: 14px;
    line-height: 1.5;
    color: var(--app-muted);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
  }
`;
