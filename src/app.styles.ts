import { css } from "lit";

export default css`
  :host {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 0;
  }

  .layout {
    display: flex;
    flex: 1;
    gap: 16px;
    min-height: 0;
  }

  .main {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
  }

  .logs {
    flex: 0 0 30%;
    max-width: 30%;
    min-width: 320px;
    min-height: 0;
  }

  @media (max-width: 900px) {
    .layout {
      flex-direction: column;
    }

    .logs {
      flex: 0 0 auto;
      max-width: 100%;
      min-width: 0;
    }
  }
`;
