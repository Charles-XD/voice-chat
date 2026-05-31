import { css } from "lit";

export default css`
  :host {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    width: 100%;
    overflow: hidden;
    --app-header-height: 58px;
  }

  app-nav {
    flex-shrink: 0;
  }

  main {
    display: flex;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    justify-content: center;
    padding: 24px;
    background: var(--app-bg);
    color: var(--app-text);
  }

  @media (max-width: 900px) {
    main {
      padding: 12px;
    }
  }

  main > voice-app {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
`;
