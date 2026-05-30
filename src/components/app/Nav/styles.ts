import { css } from "lit";

export default css`
  :host {
    display: block;
    flex-shrink: 0;
    width: 100%;
    position: relative;
    z-index: 60;
  }

  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 16px;
    background: var(--app-surface-2);
    border-bottom: 1px solid var(--app-border);
  }

  .menu-toggle,
  .drawer-backdrop,
  .nav-drawer,
  .nav-mobile-actions {
    display: none;
  }

  .nav-left {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    min-width: 0;
  }

  .nav-links {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
  }

  a {
    color: var(--app-text);
    text-decoration: none;
    font-weight: 500;
    font-size: 15px;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid transparent;
  }

  a:hover {
    background: var(--app-hover);
  }

  a:focus-visible {
    outline: none;
    border-color: var(--app-link);
    box-shadow: 0 0 0 3px var(--app-focus);
  }

  a.active {
    color: var(--app-link);
    background: color-mix(in oklab, var(--app-link) 14%, transparent);
    border-color: color-mix(in oklab, var(--app-link) 35%, transparent);
  }

  .nav-right {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .icon-button {
    appearance: none;
    -webkit-tap-highlight-color: transparent;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: 34px;
    height: 34px;
    padding: 0;
    justify-content: center;
    border-radius: 999px;
    border: 1px solid var(--app-border);
    background: color-mix(in oklab, var(--app-surface) 70%, transparent);
    color: var(--app-text);
    font: inherit;
    font-size: 13px;
    line-height: 1;
    cursor: pointer;
    user-select: none;
    text-decoration: none;
  }

  .icon-button:hover {
    background: var(--app-hover);
  }

  .icon-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--app-focus);
  }

  .icon-button.active {
    color: var(--app-link);
    border-color: var(--app-link);
    background: color-mix(in oklab, var(--app-link) 14%, transparent);
  }

  .icon-button svg {
    width: 18px;
    height: 18px;
    display: block;
  }

  @media (max-width: 900px) {
    nav {
      align-items: center;
    }

    .nav-left,
    .nav-right {
      display: none;
    }

    .menu-toggle {
      appearance: none;
      -webkit-tap-highlight-color: transparent;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      width: 34px;
      height: 34px;
      padding: 0;
      border: 1px solid var(--app-border);
      border-radius: 999px;
      background: color-mix(in oklab, var(--app-surface) 70%, transparent);
      color: var(--app-text);
      cursor: pointer;
    }

    .menu-toggle:hover {
      background: var(--app-hover);
    }

    .menu-toggle:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px var(--app-focus);
    }

    .nav-mobile-actions {
      display: flex;
      align-items: center;
      flex: 0 0 auto;
      margin-left: auto;
    }

    .drawer-backdrop {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 70;
      border: 0;
      padding: 0;
      background: color-mix(in oklab, #000 45%, transparent);
      opacity: 0;
      pointer-events: none;
      cursor: pointer;
      transition: opacity 220ms ease;
    }

    :host([data-drawer-open]) .drawer-backdrop,
    nav.drawer-open ~ .drawer-backdrop {
      opacity: 1;
      pointer-events: auto;
    }

    .nav-drawer {
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 80;
      width: min(100vw - 40px, 320px);
      background: var(--app-surface);
      border-right: 1px solid var(--app-border);
      box-shadow: 8px 0 32px rgba(0, 0, 0, 0.24);
      transform: translateX(-100%);
      transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
      overflow-y: auto;
    }

    :host([data-drawer-open]) .nav-drawer,
    nav.drawer-open ~ .nav-drawer {
      transform: translateX(0);
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 16px;
      border-bottom: 1px solid var(--app-border);
      background: var(--app-surface-2);
      flex: 0 0 auto;
    }

    .drawer-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--app-text);
    }

    .drawer-close {
      appearance: none;
      -webkit-tap-highlight-color: transparent;
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
      background: var(--app-hover);
    }

    .drawer-close:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px var(--app-focus);
    }

    .drawer-links {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px;
      flex: 1 1 auto;
    }

    .drawer-link {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      box-sizing: border-box;
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 15px;
      border: 1px solid transparent;
    }

    .drawer-link svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .drawer-theme {
      appearance: none;
      background: transparent;
      color: var(--app-text);
      font: inherit;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
    }

    .drawer-theme:hover {
      background: var(--app-hover);
    }

    .drawer-footer {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px;
      border-top: 1px solid var(--app-border);
      flex: 0 0 auto;
    }

    .drawer-status {
      padding: 8px 14px 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .nav-drawer,
    .drawer-backdrop {
      transition: none;
    }
  }
`;
