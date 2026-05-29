import { css } from "lit";

export default css`
  .logs {
    font-family: var(--app-font);
    padding: 12px;
    background: var(--app-bg);
    color: var(--app-text);
    border-radius: 12px;
    width: 100%;
    box-sizing: border-box;
    max-height: 400px;
    overflow: auto;
  }

  .title {
    font-weight: bold;
    margin-bottom: 8px;
    color: var(--app-link);
  }

  .list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .log {
    padding: 8px 10px;
    border-radius: 8px;
    background: var(--app-surface);
    display: flex;
    flex-direction: column;
    gap: 4px;

    animation: slideIn 220ms ease-out;
  }

  .meta {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    opacity: 0.7;
  }

  .level {
    text-transform: uppercase;
    font-weight: bold;
  }

  .message {
    font-size: 13px;
    line-height: 1.4;
    word-break: break-word;
  }

  .log-info {
    border-left: 4px solid #3b82f6;
  }

  .log-success {
    border-left: 4px solid #64f464;
  }

  .log-warn {
    border-left: 4px solid #f59e0b;
  }

  .log-error {
    border-left: 4px solid #ef4444;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
