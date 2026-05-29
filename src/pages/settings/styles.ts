import { css } from "lit";

export default css`
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .wrapper {
    width: 100%;
    max-width: 560px;
  }

  .title {
    margin: 0 0 8px;
    font-size: 20px;
  }

  .subtitle {
    margin: 0 0 24px;
    font-size: 13px;
    color: var(--app-muted);
  }

  .error {
    margin: 0 0 16px;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 13px;
    color: var(--app-danger);
    border: 1px solid var(--app-danger);
    background: color-mix(in oklab, var(--app-danger) 12%, transparent);
  }

  .card {
    box-sizing: border-box;
    padding: 20px;
    margin: 0 0 16px;
    border-radius: 16px;
    border: 1px solid var(--app-border);
    background: var(--app-surface);
  }

  .card h2 {
    margin: 0 0 16px;
    font-size: 15px;
  }

  .preview {
    width: 100%;
    aspect-ratio: 16 / 9;
    margin-bottom: 16px;
    border-radius: 12px;
    overflow: hidden;
    background: var(--app-surface-2);
    border: 1px solid var(--app-border);
  }

  .preview video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scaleX(-1); /* mirror like a selfie cam */
  }

  .preview-off {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--app-muted);
    font-size: 13px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }

  .field > span {
    font-size: 13px;
    color: var(--app-muted);
  }

  .select-wrap {
    position: relative;
    width: 100%;
  }

  .select {
    width: 100%;
    box-sizing: border-box;
    padding: 10px 40px 10px 12px;
    border-radius: 10px;
    border: 1px solid var(--app-border);
    background: var(--app-surface-2);
    color: var(--app-text);
    font-family: var(--app-font);
    font-size: 14px;
    appearance: none;
    -webkit-appearance: none;
  }

  .select:focus {
    outline: none;
    border-color: var(--app-link);
    box-shadow: 0 0 0 3px var(--app-focus);
  }

  .select-arrow {
    position: absolute;
    top: 50%;
    right: 8px;
    width: 16px;
    height: 16px;
    transform: translateY(-50%);
    color: var(--app-muted);
    pointer-events: none;
    transition: transform 150ms ease;
  }

  /* :open matches a native <select> only while its picker is showing. */
  .select:open + .select-arrow {
    transform: translateY(-50%) rotate(180deg);
  }

  .meter {
    width: 100%;
    height: 10px;
    border-radius: 999px;
    background: var(--app-surface-2);
    border: 1px solid var(--app-border);
    overflow: hidden;
  }

  .meter-fill {
    height: 100%;
    width: 0%;
    border-radius: 999px;
    background: var(--signal-good);
    transition: width 80ms linear;
  }

  .switch {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    font-size: 14px;
    cursor: pointer;
  }

  .switch input {
    width: 16px;
    height: 16px;
    accent-color: var(--ui-button-bg);
    cursor: pointer;
  }

  ui-button {
    display: inline-block;
    margin-top: 4px;
  }
`;
