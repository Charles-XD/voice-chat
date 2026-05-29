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

  .textfield {
    width: 100%;
  }

  .remember {
    align-items: center;
    display: flex;
    margin: 8px 0px;
  }
  .remember label {
    font-size: 13px;
    color: var(--app-text);
  }

  ui-button {
    width: 100%;
    display: block;
  }

  ui-button::part(button) {
    width: 100%;
    margin: 8px 0px;
  }

  .or {
    display: block;
    text-align: center;
  }
`;
