import { css } from "lit";

export default css`
  :host {
    display: block;
    box-sizing: border-box;
  }

  .label {
    display: block;
    margin-bottom: 6px;
    margin-left: 4px;
    font-size: 13px;
    font-weight: 500;
    color: var(--app-text);
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

  input.invalid {
    border-color: var(--app-danger);
  }

  input.invalid:focus-visible {
    border-color: var(--app-danger);
    box-shadow: 0 0 0 3px var(--app-danger-focus);
  }

  .error {
    display: block;
    margin-top: 6px;
    font-size: 12px;
    color: var(--app-danger);
  }
`;
