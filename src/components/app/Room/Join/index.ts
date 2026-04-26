import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { logger } from "../../_services/logger.service";
import { socketService } from "../../_services/socket.service";

@customElement('app-room-join')
export class RoomJoin extends LitElement {
  @state()
  private roomName = 'asd';

  private async handleJoinRoom() {
    const joined = await socketService.joinRoom(this.roomName);

    joined ? 
      logger.log("INFO", `Joined room ${this.roomName}.`) 
      : logger.log("ERROR", `Could not join ${this.roomName}.`);
  }

  private handleRoomNameChange(e: CustomEvent) {
    logger.log("INFO", JSON.stringify(e.detail));

    this.roomName = e.detail;
  }

  override render() {
    return html`
      <div>
        Room:
        <ui-textfield .value=${this.roomName} @onChange=${this.handleRoomNameChange}></ui-textfield>
        <ui-button @onClick=${this.handleJoinRoom}>Join</ui-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-room-join': RoomJoin;
  }
}