import { css } from "lit";

export default css`
  :host {
    display: inline-block;
  }

  button {
    position: relative;
    appearance: none;
    -webkit-tap-highlight-color: transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: auto;

    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid transparent;

    font-family: var(--app-font);
    font-size: 13px;
    font-weight: 500;
    line-height: 1;

    background: var(--ui-button-bg);
    color: var(--ui-button-fg);

    cursor: pointer;
    transition:
      background-color 140ms ease,
      border-color 140ms ease,
      box-shadow 140ms ease,
      transform 80ms ease;
  }

  button:hover:not(:disabled) {
    background: var(--ui-button-bg-hover);
  }

  button.secondary {
    background: color-mix(in oklab, var(--app-text) 12%, var(--app-surface));
    color: var(--app-text);
    border-color: var(--app-border);
  }

  button.secondary:hover:not(:disabled) {
    background: color-mix(in oklab, var(--app-text) 20%, var(--app-surface));
  }

  button.error {
    background: var(--app-danger);
    color: #ffffff;
    border-color: transparent;
  }

  button.error:hover:not(:disabled) {
    background: color-mix(in oklab, var(--app-danger) 85%, #000);
  }

  button.error:focus-visible {
    box-shadow: 0 0 0 3px var(--app-danger-focus);
  }

  button:active:not(:disabled) {
    transform: translateY(0.5px);
  }

  button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.35);
  }

  button:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  /*
   * Loading: a "shooting star" comet glides around the button border at a
   * constant speed. The trail is built from many small dots that each ride the
   * border path (offset-path: border-box) independently, so the tail bends
   * around the rounded corners instead of staying a straight rigid line.
   * Motion Path with linear timing keeps the speed uniform along the perimeter.
   */
  button.loading {
    cursor: progress;
    /* Dim the button (disabled look) while loading, but keep the comet crisp. */
    background: color-mix(in oklab, var(--ui-button-bg) 45%, var(--app-bg));
    color: color-mix(in oklab, var(--ui-button-fg) 55%, transparent);
    opacity: 1;
  }

  .comet {
    display: contents;
  }

  .comet-dot {
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #ffffff;
    /* The head is full size/opacity; each trailing dot fades and shrinks. */
    opacity: calc(1 - var(--i) / 12);
    transform: scale(calc(1 - var(--i) / 26));
    offset-path: border-box;
    offset-distance: 0%;
    animation: ui-shooting-star 1.4s linear infinite;
    /* Positive, staggered delays trail each dot behind the leading head. */
    animation-delay: calc(var(--i) * 0.01s);
    pointer-events: none;
  }

  .comet-dot:first-child {
    box-shadow: 0 0 8px 1px rgba(255, 255, 255, 0.7);
  }

  @keyframes ui-shooting-star {
    to {
      offset-distance: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    button {
      transition: none;
    }
    button:active:not(:disabled) {
      transform: none;
    }
    .comet {
      display: none;
    }
  }
`;
