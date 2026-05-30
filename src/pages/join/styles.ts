import { css } from "lit";

export default css`
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .card {
    width: 100%;
    max-width: 460px;
    box-sizing: border-box;
    padding: 28px;
    border-radius: 16px;
    border: 1px solid var(--app-border);
    background: var(--app-surface);
  }

  .title {
    margin: 0 0 8px;
    font-size: 20px;
  }

  .subtitle {
    margin: 0 0 24px;
    font-size: 13px;
    color: var(--app-muted);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  ui-button {
    display: block;
  }

  ui-button::part(button) {
    width: 100%;
  }

  .waiting {
    padding: 20px 16px;
    border-radius: 12px;
    border: 1px solid var(--app-border);
    background: color-mix(in oklab, var(--app-link) 8%, var(--app-surface));
    text-align: center;
  }

  .waiting-text {
    margin: 0 0 6px;
    font-size: 14px;
    color: var(--app-text);
  }

  .waiting-room {
    margin: 0;
    font-size: 12px;
    color: var(--app-muted);
  }

  @media (max-width: 720px) {
    .card {
      padding: 20px;
    }
  }
`;
