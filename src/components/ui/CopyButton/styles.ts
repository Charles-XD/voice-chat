import { css } from "lit";

export default css`
  :host {
    display: inline-block;
  }

  button {
    appearance: none;
    -webkit-tap-highlight-color: transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: 34px;
    height: 34px;
    padding: 0;
    border-radius: 999px;

    border: 1px solid var(--app-border);
    background: color-mix(in oklab, var(--app-surface) 70%, transparent);
    color: var(--app-text);

    font-family: var(--app-font);

    cursor: pointer;
    transition:
      background-color 140ms ease,
      border-color 140ms ease,
      box-shadow 140ms ease,
      transform 80ms ease;
  }

  button:hover:not(:disabled) {
    background: var(--app-hover);
  }

  button:active:not(:disabled) {
    transform: translateY(0.5px);
  }

  button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--app-focus);
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  button.copied {
    color: var(--status-connected-dot);
    border-color: var(--status-connected-border);
  }

  svg {
    width: 18px;
    height: 18px;
    display: block;
  }
`;
