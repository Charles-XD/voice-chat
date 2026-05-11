import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { logger } from "../../_services/logger.service";
import { socketService } from "../../_services/socket.service";
import { consume } from "@lit/context";
import { roomContext, RoomState } from "../../_context/room.context";

@customElement("app-room-join")
export class RoomJoin extends LitElement {
  @state()
  private roomName = "";

  @consume({ context: roomContext, subscribe: true })
  @property({ attribute: false })
  room?: RoomState;

  private async handleJoinRoom() {
    const joined = await socketService.joinRoom(this.roomName);

    if (joined) {
      logger.log("SUCCESS", `Joined the room (${this.roomName}).`);
      this.dispatchEvent(
        new CustomEvent("room-change", {
          detail: {
            name: this.roomName,
          },
          bubbles: true,
          composed: true,
        }),
      );
    } else {
      logger.log("ERROR", `Could not join ${this.roomName}.`);
    }
  }

  private async handleLeaveRoom() {
    await socketService.leaveRoom(this.roomName);
    logger.log("ERROR", `Left the room (${this.roomName}).`);
    this.roomName = "";
    this.dispatchEvent(
      new CustomEvent("room-change", {
        detail: {
          name: "",
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleRoomNameChange(e: CustomEvent) {
    this.roomName = e.detail;
  }

  override render() {
    return html`
      <div>
        Room:
        <ui-textfield
          .disabled=${Boolean(this.room?.name)}
          .value=${this.roomName}
          @onChange=${this.handleRoomNameChange}
        ></ui-textfield>
        ${this.room?.name
          ? html`<ui-button @onClick=${this.handleLeaveRoom}>Leave</ui-button>`
          : html`<ui-button @onClick=${this.handleJoinRoom}>Join</ui-button>`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-room-join": RoomJoin;
  }
}
