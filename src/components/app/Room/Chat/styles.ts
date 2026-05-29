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

  .title {
    flex: 0 0 auto;
    margin: 0;
    padding: 12px 16px;
    font-size: 15px;
    color: var(--app-text);
    border-bottom: 1px solid var(--app-border);
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

  .field {
    flex: 1 1 auto;
    box-sizing: border-box;
    min-height: 38px;
    max-height: 120px;
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
