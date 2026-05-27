import { CSSResultGroup, LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { SocketConnectionStatus, socketService } from "../_services/socket.service";

@customElement('app-connection-status')
export class ConnectionStatus extends LitElement {
  static styles?: CSSResultGroup = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      line-height: 1;
      user-select: none;
      color: var(--app-text, #e5e7eb);
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid;
      font-weight: 600;
      letter-spacing: 0.2px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      position: relative;
    }

    @keyframes dotPulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.08);
      }
      100% {
        transform: scale(1);
      }
    }

    @keyframes dotRipple {
      0% {
        opacity: 0.35;
        transform: translate(-50%, -50%) scale(1);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(2.6);
      }
    }

    .pill[data-state="connected"] .dot,
    .pill[data-state="connecting"] .dot,
    .pill[data-state="reconnecting"] .dot {
      animation: dotPulse 1.1s ease-in-out infinite;
    }

    .pill[data-state="connected"] .dot::after,
    .pill[data-state="connecting"] .dot::after,
    .pill[data-state="reconnecting"] .dot::after {
      content: "";
      position: absolute;
      left: 50%;
      top: 50%;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 1px solid currentColor;
      transform: translate(-50%, -50%);
      opacity: 0;
      animation: dotRipple 1.6s ease-out infinite;
    }

    .pill[data-state="connected"] {
      color: var(--status-connected-fg, #86efac);
      background: var(--status-connected-bg, rgba(34, 197, 94, 0.14));
      border-color: var(--status-connected-border, rgba(34, 197, 94, 0.35));
    }
    .pill[data-state="connected"] .dot {
      background: var(--status-connected-dot, #22c55e);
      box-shadow: 0 0 0 2px var(--status-connected-ring, rgba(34, 197, 94, 0.15));
    }

    .pill[data-state="connecting"] {
      color: var(--status-connecting-fg, #fcd34d);
      background: var(--status-connecting-bg, rgba(245, 158, 11, 0.14));
      border-color: var(--status-connecting-border, rgba(245, 158, 11, 0.35));
    }
    .pill[data-state="connecting"] .dot {
      background: var(--status-connecting-dot, #f59e0b);
      box-shadow: 0 0 0 2px var(--status-connecting-ring, rgba(245, 158, 11, 0.15));
    }

    .pill[data-state="reconnecting"] {
      color: var(--status-reconnecting-fg, var(--status-connecting-fg, #fcd34d));
      background: var(--status-reconnecting-bg, var(--status-connecting-bg, rgba(245, 158, 11, 0.14)));
      border-color: var(--status-reconnecting-border, var(--status-connecting-border, rgba(245, 158, 11, 0.35)));
    }
    .pill[data-state="reconnecting"] .dot {
      background: var(--status-reconnecting-dot, var(--status-connecting-dot, #f59e0b));
      box-shadow: 0 0 0 2px var(--status-reconnecting-ring, var(--status-connecting-ring, rgba(245, 158, 11, 0.15)));
    }

    .pill[data-state="disconnected"] {
      color: var(--status-disconnected-fg, #fca5a5);
      background: var(--status-disconnected-bg, rgba(239, 68, 68, 0.14));
      border-color: var(--status-disconnected-border, rgba(239, 68, 68, 0.35));
    }
    .pill[data-state="disconnected"] .dot {
      background: var(--status-disconnected-dot, #ef4444);
      box-shadow: 0 0 0 2px var(--status-disconnected-ring, rgba(239, 68, 68, 0.15));
    }

    @media (prefers-reduced-motion: reduce) {
      .pill[data-state="connected"] .dot,
      .pill[data-state="connecting"] .dot,
      .pill[data-state="reconnecting"] .dot {
        animation: none;
      }
      .pill[data-state="connected"] .dot::after,
      .pill[data-state="connecting"] .dot::after,
      .pill[data-state="reconnecting"] .dot::after {
        animation: none;
        display: none;
      }
    }

    .meta {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
  `;

  @state()
  private status: SocketConnectionStatus = socketService.socket.connected ? "connected" : "connecting";

  @state()
  private latency = 0;

  private unsubscribe?: () => void;

  override connectedCallback() {
    super.connectedCallback();

    this.unsubscribe = socketService.onStatusChange((status, latency) => {
      this.latency = latency;
      this.status = status;
    });
  }

  override disconnectedCallback() {
    this.unsubscribe?.();
    super.disconnectedCallback();
  }

  override render() {
    const state = this.status;
    const label =
      this.status === "connected"
        ? "Connected"
        : this.status === "reconnecting"
          ? "Reconnecting"
          : this.status === "connecting"
            ? "Connecting"
            : "Disconnected";
    const isConnected = this.status === "connected";

    return html`
      <span class="pill" data-state=${state} role="status" aria-live="polite">
        <span class="dot" aria-hidden="true"></span>
        <span>${label}</span>
      </span>

      <span class="meta">
        <app-ping .connected=${isConnected} .latency=${this.latency}></app-ping>
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-connection-status": ConnectionStatus;
  }
}