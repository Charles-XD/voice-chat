import { consume } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { type RoomState, roomContext } from "../../_context/room.context";
import { callService } from "../../_services/call.service";
import { logger } from "../../_services/logger.service";
import { socketService } from "../../_services/socket.service";

import styles from "./styles";

@customElement("app-room-actions")
export class RoomActions extends LitElement {
  static styles = styles;

  @consume({ context: roomContext, subscribe: true })
  @state()
  room?: RoomState;

  @state() private muted = true;

  private unsubscribe?: () => void;

  override connectedCallback(): void {
    super.connectedCallback();
    // Mirror the single source of truth for mic state.
    this.unsubscribe = callService.subscribe((call) => {
      this.muted = call?.muted ?? true;
    });
  }

  override disconnectedCallback(): void {
    this.unsubscribe?.();
    super.disconnectedCallback();
  }

  private navigate(url: string) {
    this.dispatchEvent(new CustomEvent("navigate", { detail: url, bubbles: true, composed: true }));
  }

  private async handleLeave() {
    const name = this.room?.name;
    if (name) {
      await socketService.leaveRoom(name);
      logger.log("ERROR", `Left the room (${this.room?.title ?? name}).`);
    }
    callService.end();
    this.navigate("/join");
  }

  private handleMute = (e: CustomEvent<{ muted: boolean }>) => {
    const { muted } = e.detail;
    logger.log("INFO", muted ? "Mute" : "Unmute");
    callService.update({ muted });
    socketService.socket.emit("mic-status", { muted });
  };

  override render() {
    return html`
      <div class="bar">
        <app-mute-button .muted=${this.muted} @mute-change=${this.handleMute}></app-mute-button>

        <ui-button color="error" @onClick=${this.handleLeave}>
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Leave</span>
        </ui-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-room-actions": RoomActions;
  }
}
