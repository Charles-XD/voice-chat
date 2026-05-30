import { css } from "lit";

export default css`
  :host {
    display: block;
  }

  .head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px;
  }

  .title {
    margin: 0;
    font-size: 16px;
    color: var(--app-text);
  }

  .count {
    min-width: 22px;
    padding: 0 6px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    font-size: 12px;
    background: color-mix(in oklab, var(--app-text) 12%, var(--app-surface));
    color: var(--app-muted);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 16px;
  }

  .cell {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    aspect-ratio: 1 / 1;
    padding: 16px;
    border-radius: 16px;
    border: 1px solid var(--app-border);
    background: var(--app-surface-2);
    overflow: hidden;
  }

  /* Screen share: full-width row at the top of the grid. */
  .cell.sharing {
    grid-column: 1 / -1;
    aspect-ratio: auto;
    gap: 10px;
    padding: 12px;
  }

  /* Camera fills the member tile but keeps the normal grid cell size. */
  .cell.camera {
    padding: 10px;
    gap: 10px;
  }

  .cell.camera .media {
    aspect-ratio: 1 / 1;
  }

  .avatar {
    position: relative;
    width: 72px;
    height: 72px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 600;
    color: var(--app-text);
    border: 1px solid var(--app-border);
    background: color-mix(in oklab, var(--app-text) 12%, var(--app-surface));
  }

  .media {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 12px;
    overflow: hidden;
    background: #000;
  }

  .media-label {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: var(--app-muted);
    background: color-mix(in oklab, var(--app-surface-2) 85%, #000);
    pointer-events: none;
  }

  .media.pending video {
    opacity: 0;
  }

  .media video {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .media.camera video {
    object-fit: cover;
  }

  .media video.mirror {
    transform: scaleX(-1);
  }

  /* Talking: cell border/background; pulse ring on avatar or overlay (not the video). */
  .cell.speaking {
    border-color: color-mix(in oklab, var(--status-connected-dot, #22c55e) 55%, var(--app-border));
    background: color-mix(in oklab, var(--status-connected-dot, #22c55e) 8%, var(--app-surface-2));
  }

  .cell.speaking .avatar {
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--status-connected-dot, #22c55e) 70%, transparent);
    animation: speaking-pulse 1.3s ease-out infinite;
  }

  /* Ring overlay — avoids repainting the video layer. */
  .cell.speaking .media::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 2;
    border-radius: inherit;
    pointer-events: none;
    animation: speaking-pulse 1.3s ease-out infinite;
  }

  @keyframes speaking-pulse {
    0% {
      box-shadow: inset 0 0 0 0 color-mix(in oklab, var(--status-connected-dot, #22c55e) 65%, transparent);
    }
    70% {
      box-shadow: inset 0 0 0 10px transparent;
    }
    100% {
      box-shadow: inset 0 0 0 0 transparent;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cell.speaking .avatar,
    .cell.speaking .media::after {
      animation: none;
    }
  }

  .name {
    box-sizing: border-box;
    max-width: 100%;
    padding: 0 32px;
    font-size: 13px;
    color: var(--app-text);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .cell.sharing .name {
    padding: 0 36px 0 8px;
    align-self: flex-start;
    text-align: left;
  }

  /* Mic status badge in the bottom-right corner of the cell. */
  .mic {
    position: absolute;
    right: 8px;
    bottom: 8px;
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid var(--app-border);
  }

  .mic.live {
    background: color-mix(in oklab, var(--status-connected-dot, #22c55e) 22%, var(--app-surface));
    color: var(--status-connected-dot, #22c55e);
  }

  .mic.muted {
    background: color-mix(in oklab, var(--app-danger) 22%, var(--app-surface));
    color: var(--app-danger);
    border-color: color-mix(in oklab, var(--app-danger) 45%, var(--app-border));
  }

  .empty {
    margin: 0;
    font-size: 13px;
    color: var(--app-muted);
  }

  @media (max-width: 899px) {
    .grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }
  }

  @media (min-width: 900px) {
    .grid {
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
    }

    .cell {
      padding: 20px;
      gap: 18px;
    }

    .avatar {
      width: 144px;
      height: 144px;
      font-size: 48px;
    }

    .name {
      font-size: 15px;
    }
  }
`;
