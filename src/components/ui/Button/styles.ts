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
    gap: 8px;
    width: auto;

    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid transparent;

    font-family: var(--app-font);
    font-size: 13px;
    font-weight: 500;
    line-height: 1;

    background: var(--ui-button-bg);
    color: var(--ui-button-fg);

    cursor: pointer;
    transition:
      background-color 140ms ease,
      border-color 140ms ease,
      box-shadow 140ms ease,
      transform 80ms ease;
  }

  button:hover:not(:disabled) {
    background: var(--ui-button-bg-hover);
  }

  button:active:not(:disabled) {
    transform: translateY(0.5px);
  }

  button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.35);
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  @media (prefers-reduced-motion: reduce) {
    button {
      transition: none;
    }
    button:active:not(:disabled) {
      transform: none;
    }
  }
`;
