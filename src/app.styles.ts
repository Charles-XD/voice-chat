import { css } from "lit";

export default css`
  :host {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    width: 100%;
    overflow: hidden;
  }

  .layout {
    position: relative;
    display: flex;
    flex: 1;
    gap: 16px;
    min-height: 0;
    overflow: hidden;
  }

  .panel-toggle {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 5;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid var(--app-border);
    border-radius: 8px;
    background: var(--app-surface);
    color: var(--app-text);
    cursor: pointer;
    transition: background-color 140ms ease;
  }

  .panel-toggle:hover {
    background: color-mix(in oklab, var(--app-text) 12%, var(--app-surface));
  }

  .panel-toggle.is-collapsed {
    color: var(--app-muted);
  }

  .layout.panel-collapsed .logs {
    display: none;
  }

  .status {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex: 1;
    color: var(--app-muted);
    font-size: 14px;
  }

  .status.error {
    color: var(--app-text);
  }

  .main {
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
    overflow-y: auto;
  }

  .logs {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 0 0 36%;
    max-width: 36%;
    min-width: 380px;
    min-height: 0;
    overflow-y: auto;
    padding: 16px;
    padding-top: 40px;
    background: var(--app-bg);
    border: 1px solid var(--app-border);
    border-radius: 14px;
  }

  @media (min-width: 1280px) {
    .logs {
      flex: 0 0 28%;
      max-width: 28%;
      min-width: 320px;
    }
  }

  .logs app-logs {
    flex: 1 1 auto;
    min-height: 0;
  }

  @media (max-width: 900px) {
    .layout {
      flex-direction: column;
    }

    .logs {
      flex: 0 0 auto;
      max-width: 100%;
      min-width: 0;
    }
  }
`;
