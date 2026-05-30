import { css } from "lit";

export default css`
  :host {
    display: block;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid var(--app-border);
    background: var(--app-surface);
    box-shadow: 0 1px 0 color-mix(in oklab, var(--app-border) 40%, transparent);
  }

  .bar app-mute-button,
  .bar ui-button {
    flex: 0 0 auto;
    max-width: 100%;
  }

  /* Push the leave button to the far right when space allows. */
  .bar ui-button[color="error"] {
    margin-left: auto;
  }
`;
