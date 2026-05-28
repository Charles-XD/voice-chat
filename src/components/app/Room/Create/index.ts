import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { socketService } from "../../_services/socket.service";
import { routerService } from "../../_services/router.service";

@customElement("app-room-create")
export class RoomCreate extends LitElement {
  static styles?: CSSResultGroup = css`
    :host {
      display: flex;
      flex-direction: column;
    }

    .subtitle {
      color: var(--app-muted, #94a3b8);
      margin-bottom: 8px;
    }

    .key-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .textfield {
      width: 100%;
    }
  `;

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
    const url = "/voice";
    this.dispatchEvent(
      new CustomEvent("navigate", {
        detail: `${url}`,
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
