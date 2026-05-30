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

  .main-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  }

  .main-head app-current-room {
    flex: 1 1 auto;
    min-width: 0;
  }

  .panel-toggle,
  .panel-open-mobile,
  .drawer-backdrop,
  .drawer-header {
    appearance: none;
    -webkit-tap-highlight-color: transparent;
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

  .panel-open-mobile,
  .drawer-backdrop,
  .drawer-header {
    display: none;
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

    .panel-toggle {
      display: none;
    }

    .panel-open-mobile {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      flex: 0 0 auto;
      height: 36px;
      padding: 0 12px;
      border: 1px solid var(--app-border);
      border-radius: 999px;
      background: var(--app-surface);
      color: var(--app-text);
      font-family: var(--app-font);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 140ms ease;
    }

    .panel-open-mobile:hover {
      background: color-mix(in oklab, var(--app-text) 12%, var(--app-surface));
    }

    .panel-open-mobile svg {
      display: block;
      flex-shrink: 0;
    }

    .drawer-backdrop {
      display: block;
      position: fixed;
      top: var(--app-header-height, 58px);
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 40;
      border: 0;
      padding: 0;
      background: color-mix(in oklab, #000 45%, transparent);
      opacity: 0;
      pointer-events: none;
      cursor: pointer;
      transition: opacity 220ms ease;
    }

    .layout.drawer-open .drawer-backdrop {
      opacity: 1;
      pointer-events: auto;
    }

    .layout.panel-collapsed .logs {
      display: flex;
    }

    .logs {
      position: fixed;
      top: var(--app-header-height, 58px);
      right: 0;
      bottom: 0;
      z-index: 50;
      flex: none;
      width: min(100vw - 40px, 380px);
      max-width: none;
      min-width: 0;
      margin: 0;
      padding: 0;
      border-radius: 16px 0 0 16px;
      border-right: none;
      box-shadow: -8px 0 32px rgba(0, 0, 0, 0.24);
      transform: translateX(100%);
      transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
      overflow-y: auto;
      overflow-x: hidden;
    }

    .layout.drawer-open .logs {
      transform: translateX(0);
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex: 0 0 auto;
      padding: 14px 16px;
      border-bottom: 1px solid var(--app-border);
      background: var(--app-surface);
    }

    .drawer-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--app-text);
    }

    .drawer-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      border: 1px solid var(--app-border);
      border-radius: 8px;
      background: var(--app-surface-2);
      color: var(--app-text);
      cursor: pointer;
    }

    .drawer-close:hover {
      background: color-mix(in oklab, var(--app-text) 12%, var(--app-surface-2));
    }

    .logs app-room-share,
    .logs app-room-participants,
    .logs app-room-chat,
    .logs app-logs {
      flex: 0 0 auto;
    }

    .logs app-logs {
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
      padding: 0 16px 16px;
    }

    .logs app-room-share,
    .logs app-room-participants,
    .logs app-room-chat {
      padding: 0 16px;
    }

    .logs app-room-share {
      padding-top: 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .logs,
    .drawer-backdrop {
      transition: none;
    }
  }
`;
