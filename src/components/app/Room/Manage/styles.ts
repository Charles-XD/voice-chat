import { css } from "lit";

export default css`
  :host {
    display: block;
  }

  .manage {
    border: 1px solid var(--app-border, #2a2a2a);
    border-radius: 12px;
    padding: 16px;
    background: var(--app-surface);
  }

  .heading {
    margin: 0 0 4px;
    font-size: 16px;
  }

  .subtitle {
    color: var(--app-muted);
    margin: 0 0 12px;
    font-size: 13px;
  }

  form {
    display: flex;
    align-items: flex-end;
    gap: 8px;
  }

  ui-textfield {
    flex: 1;
  }

  .allowed {
    list-style: none;
    margin: 12px 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .allowed li {
    background: var(--app-surface, #1c1c1c);
    border: 1px solid var(--app-border, #2a2a2a);
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 12px;
    font-family: var(--app-font);
  }

  .empty {
    color: var(--app-muted);
    font-size: 12px;
    margin: 12px 0 0;
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
