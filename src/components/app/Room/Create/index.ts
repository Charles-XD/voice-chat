import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { socketService } from "../../_services/socket.service";

import styles from "./styles";

@customElement("app-room-create")
export class RoomCreate extends LitElement {
  static styles = styles;

  @property({ attribute: false })
  @state()
  roomName: string = socketService.socket.id ?? "";

  private handleRoomNameChange(e: CustomEvent) {
    this.roomName = e.detail;
  }

  override connectedCallback() {
    super.connectedCallback();

    socketService.socket.on("connect", () => {
      this.roomName = socketService.socket.id ?? "";
      this.requestUpdate();
    });
  }

  handleStartVoiceChat() {
    if (!this.roomName) return;
    this.dispatchEvent(
      new CustomEvent("navigate", {
        detail: `/voice/${encodeURIComponent(this.roomName)}`,
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <p class="subtitle">Share this <strong>Key</strong> to invite others.</p>
      <div class="key-row">
        <ui-textfield
          class="textfield"
          disabled
          .value=${this.roomName}
          @onChange=${this.handleRoomNameChange}
        ></ui-textfield>
        <ui-copy-button .value=${this.roomName}></ui-copy-button>
      </div>
      <br />
      <ui-button @onClick=${this.handleStartVoiceChat}>
        Start Voice Chat
      </ui-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-room-create": RoomCreate;
  }
}
