import { css } from "lit";

export default css`
  :host {
    display: block;
    position: sticky;
    top: 0;
    z-index: 10;
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

  /* Active route highlight */
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

  @media (max-width: 520px) {
    nav {
      align-items: flex-start;
    }
    .user-info {
      width: 100%;
      justify-content: space-between;
    }
  }
`;
