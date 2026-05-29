import { css } from "lit";

export default css`
  :host {
    display: block;
    box-sizing: border-box;
  }

  input {
    width: 100%;
    box-sizing: border-box;

    padding: 8px 10px;
    margin: 0;
    border-radius: 6px;
    border: 1px solid var(--app-border);

    background: var(--app-surface);
    color: var(--app-text);

    line-height: 1.5rem;
    font: inherit;

    outline: none;
  }

  input::placeholder {
    color: var(--app-muted);
    opacity: 0.9;
  }

  input:focus-visible {
    border-color: var(--app-link);
    box-shadow: 0 0 0 3px var(--app-focus);
  }

  input:disabled {
    cursor: not-allowed;
    opacity: 0.65;
    background: color-mix(in oklab, var(--app-surface) 80%, var(--app-bg));
  }
`;
