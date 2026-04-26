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

  @state()
  private room = 'chat';

  @state()
  private joined = false;

  private unsubscribe?: () => void;

  override connectedCallback() {
    super.connectedCallback();

    logger.log("INFO", "Connecting to server...");

    this.unsubscribe = socketService.onChange((connected, latency) => {
      this.connected = connected;
      this.latency = latency;
    });

    this.joinRoom();
  }

  override disconnectedCallback() {
    this.unsubscribe?.();
    super.disconnectedCallback();
  }

  private async joinRoom() {
    logger.log("INFO", `Joining to room (${this.room})`);
    try {
      const success = await socketService.joinRoom(this.room);
      this.joined = success;
      logger.log("SUCCESS", `Active room: (${this.room})`);
    } catch (e) {
      this.joined = false;
    }
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