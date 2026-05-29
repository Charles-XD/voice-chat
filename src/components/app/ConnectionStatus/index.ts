import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { SocketConnectionStatus, socketService } from "../_services/socket.service";

import styles from "./styles";

@customElement('app-connection-status')
export class ConnectionStatus extends LitElement {
  static styles = styles;

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