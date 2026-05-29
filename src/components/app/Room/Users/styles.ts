import { css } from "lit";

export default css`
  :host {
    display: block;
  }

  .head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px;
  }

  .title {
    margin: 0;
    font-size: 16px;
    color: var(--app-text);
  }

  .count {
    min-width: 22px;
    padding: 0 6px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    font-size: 12px;
    background: color-mix(in oklab, var(--app-text) 12%, var(--app-surface));
    color: var(--app-muted);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 16px;
  }

  .cell {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    aspect-ratio: 1 / 1;
    padding: 16px;
    border-radius: 16px;
    border: 1px solid var(--app-border);
    background: var(--app-surface-2);
    overflow: hidden;
  }

  .avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(
      135deg,
      var(--ui-button-bg),
      color-mix(in oklab, var(--ui-button-bg) 50%, var(--app-danger))
    );
  }

  .name {
    box-sizing: border-box;
    max-width: 100%;
    padding: 0 32px;
    font-size: 13px;
    color: var(--app-text);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Mic status badge in the bottom-right corner of the cell. */
  .mic {
    position: absolute;
    right: 8px;
    bottom: 8px;
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid var(--app-border);
  }

  .mic.live {
    background: color-mix(in oklab, var(--status-connected-dot, #22c55e) 22%, var(--app-surface));
    color: var(--status-connected-dot, #22c55e);
  }

  .mic.muted {
    background: color-mix(in oklab, var(--app-danger) 22%, var(--app-surface));
    color: var(--app-danger);
    border-color: color-mix(in oklab, var(--app-danger) 45%, var(--app-border));
  }

  .empty {
    margin: 0;
    font-size: 13px;
    color: var(--app-muted);
  }
`;
