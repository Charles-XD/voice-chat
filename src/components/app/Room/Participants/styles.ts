import { css } from "lit";

export default css`
  :host {
    display: block;
  }

  .panel {
    display: flex;
    flex-direction: column;
    max-height: 280px;
    border: 1px solid var(--app-border);
    border-radius: 14px;
    background: var(--app-surface);
    overflow: hidden;
  }

  .panel.collapsed {
    max-height: none;
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

  .panel.collapsed .head {
    border-bottom: none;
  }

  .title-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .title {
    margin: 0;
    font-size: 15px;
    color: var(--app-text);
  }

  .count {
    min-width: 20px;
    padding: 0 6px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    background: color-mix(in oklab, var(--app-text) 12%, var(--app-surface));
    color: var(--app-muted);
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

  .toggle.is-collapsed {
    transform: rotate(180deg);
  }

  .body {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .requests {
    flex: 0 0 auto;
    padding: 10px 12px;
    border-bottom: 1px solid var(--app-border);
    background: color-mix(in oklab, var(--app-link) 6%, var(--app-surface));
  }

  .requests-title {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--app-text);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .request-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .request {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid var(--app-border);
    background: var(--app-surface-2);
  }

  .request-info {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .request-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--app-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .request-key {
    font-size: 11px;
    color: var(--app-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .request-actions {
    display: flex;
    flex-shrink: 0;
    gap: 6px;
  }

  .members {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px;
  }

  .member {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid transparent;
  }

  .member:hover {
    background: color-mix(in oklab, var(--app-text) 6%, var(--app-surface));
  }

  .member.speaking {
    border-color: color-mix(in oklab, var(--status-connected-dot, #22c55e) 45%, var(--app-border));
    background: color-mix(in oklab, var(--status-connected-dot, #22c55e) 8%, var(--app-surface));
  }

  .avatar {
    flex: 0 0 auto;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: var(--app-text);
    border: 1px solid var(--app-border);
    background: color-mix(in oklab, var(--app-text) 12%, var(--app-surface));
  }

  .member-main {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .member-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--app-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .member-you {
    font-size: 11px;
    color: var(--app-muted);
    font-weight: 400;
  }

  .badges {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .badge {
    width: 22px;
    height: 22px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid var(--app-border);
    color: var(--app-muted);
  }

  .badge.live {
    color: var(--status-connected-dot, #22c55e);
    background: color-mix(in oklab, var(--status-connected-dot, #22c55e) 18%, var(--app-surface));
  }

  .badge.muted {
    color: var(--app-danger);
    background: color-mix(in oklab, var(--app-danger) 18%, var(--app-surface));
  }

  .badge.media {
    color: var(--app-link);
    background: color-mix(in oklab, var(--app-link) 14%, var(--app-surface));
  }

  .empty {
    margin: 12px 8px;
    font-size: 13px;
    color: var(--app-muted);
    text-align: center;
  }
`;
