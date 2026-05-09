import { css } from 'lit';

export default css`
  .logs {
    font-family: monospace;
    padding: 12px;
    background: #0f172a;
    color: #e5e7eb;
    border-radius: 12px;
    width: 100%;
    box-sizing: border-box;
    max-height: 400px;
    overflow: auto;
  }

  .title {
    font-weight: bold;
    margin-bottom: 8px;
    color: #93c5fd;
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
    background: #1e293b;
    display: flex;
    flex-direction: column;
    gap: 4px;

    animation: slideIn 220ms ease-out;
  }
`;