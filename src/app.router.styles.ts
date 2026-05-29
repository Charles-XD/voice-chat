import { css } from "lit";

export default css`
  :host {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 100%;
  }

  main {
    display: flex;
    flex-grow: 1;
    justify-content: center;
    padding: 24px;
    background: var(--app-bg);
    color: var(--app-text);
  }
`;
