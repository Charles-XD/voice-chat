import { css } from "lit";

export default css`
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .title {
    margin: 0 0 64px;
    text-align: center;
  }

  .tagline {
    margin: 0 0 20px;
    text-align: center;
    color: var(--app-muted);
  }

  .card {
    width: 100%;
    max-width: 820px;
    box-sizing: border-box;
    padding: 28px;
    border-radius: 16px;
    border: 1px solid var(--app-border);
    background: var(--app-surface);
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 24px;
    align-items: stretch;
  }

  .col {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .col h2 {
    margin: 0 0 16px;
    font-size: 16px;
  }

  .subtitle {
    margin: 0 0 16px;
    font-size: 13px;
    color: var(--app-muted);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Push the action button to the bottom so both columns align. */
  .spacer {
    flex: 1 1 auto;
  }

  ui-button {
    display: block;
  }

  ui-button::part(button) {
    width: 100%;
  }

  /* Divider between the two login options */
  .divider {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .divider::before {
    content: "";
    position: absolute;
    width: 1px;
    height: 100%;
    background: var(--app-border);
  }

  .divider span {
    position: relative;
    padding: 8px;
    border-radius: 999px;
    background: var(--app-surface);
    color: var(--app-muted);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  @media (max-width: 720px) {
    .card {
      padding: 20px;
    }

    .grid {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .divider::before {
      width: 100%;
      height: 1px;
    }

    .spacer {
      display: none;
    }
  }
`;
