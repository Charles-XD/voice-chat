import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { socketService } from "../_services/socket.service";
import { logger } from "../_services/logger.service";

@customElement('app-connection-status')
export class ConnectionStatus extends LitElement {
  @state()
  private connected = true;

  @state()
  private latency = 0;

  private unsubscribe?: () => void;

  override connectedCallback() {
    super.connectedCallback();

    this.unsubscribe = socketService.onChange((connected, latency) => {
      this.connected = connected;
      this.latency = latency;
    });
  }

  override disconnectedCallback() {
    this.unsubscribe?.();
    super.disconnectedCallback();
  }

  override render() {
    return html`
      <div>
        ${this.connected
        ? html`
              🟢 Connected
              <app-ping latency=${this.latency}></app-ping>
            `
        : html`🔴 Disconnected`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-connection-status": ConnectionStatus;
  }
}