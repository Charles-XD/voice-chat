import { css } from "lit";

export default css`
  :host {
    display: flex;
    flex-direction: column;
  }

  .subtitle {
    color: var(--app-muted);
    margin-bottom: 8px;
  }

  .key-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .textfield {
    width: 100%;
  }

  ui-button {
    display: block;
  }

  ui-button::part(button) {
    width: 100%;
  }
`;
