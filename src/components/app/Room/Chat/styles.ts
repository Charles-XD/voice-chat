import { css } from "lit";

export default css`
  :host {
    display: block;
  }

  .chat {
    display: flex;
    flex-direction: column;
    height: 320px;
    border: 1px solid var(--app-border);
    border-radius: 14px;
    background: var(--app-surface);
    overflow: hidden;
  }

  /* Collapsed: only the header remains visible. */
  .chat.collapsed {
    height: auto;
  }

  .head {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--app-border);
  }

  .chat.collapsed .head {
    border-bottom: none;
  }

  .title {
    margin: 0;
    font-size: 15px;
    color: var(--app-text);
  }

  .toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid var(--app-border);
    border-radius: 8px;
    background: var(--app-surface-2);
    color: var(--app-text);
    cursor: pointer;
    transition:
      background-color 140ms ease,
      transform 160ms ease;
  }

  .toggle:hover {
    background: color-mix(in oklab, var(--app-text) 12%, var(--app-surface));
  }

  /* Point the chevron up when collapsed to hint "expand". */
  .toggle.is-collapsed {
    transform: rotate(180deg);
  }

  .messages {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .empty {
    margin: auto;
    font-size: 13px;
    color: var(--app-muted);
  }

  .msg {
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-width: 80%;
    align-self: flex-start;
    align-items: flex-start;
  }

  .msg.mine {
    align-self: flex-end;
    align-items: flex-end;
  }

  .meta {
    display: flex;
    gap: 6px;
    font-size: 11px;
    color: var(--app-muted);
  }

  .bubble {
    padding: 8px 12px;
    border-radius: 12px;
    font-size: 13px;
    line-height: 1.4;
    color: var(--app-text);
    background: color-mix(in oklab, var(--app-text) 12%, var(--app-surface));
    border: 1px solid var(--app-border);
    word-break: break-word;
    /* Preserve newlines from multi-line messages. */
    white-space: pre-wrap;
  }

  .msg.mine .bubble {
    color: #fff;
    background: var(--ui-button-bg);
    border-color: transparent;
  }

  .composer {
    flex: 0 0 auto;
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid var(--app-border);
  }

  .composer ui-button {
    height: 38px;
    display: flex;
    align-items: center;
  }

  .field {
    flex: 1 1 auto;
    box-sizing: border-box;
    min-height: 38px;
    max-height: 92px;
    padding: 9px 12px;
    resize: none;
    overflow-y: auto;
    border-radius: 10px;
    border: 1px solid var(--app-border);
    background: var(--app-surface-2);
    color: var(--app-text);
    font-family: var(--app-font);
    font-size: 13px;
    line-height: 1.4;
    outline: none;
  }

  .field::placeholder {
    color: var(--app-muted);
  }

  .field:focus {
    border-color: var(--app-link);
    box-shadow: 0 0 0 3px var(--app-focus);
  }
`;
