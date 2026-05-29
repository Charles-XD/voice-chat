import { consume } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

import { type RoomState, roomContext } from "../../_context/room.context";

@customElement("app-current-room")
export class CurrentRoom extends LitElement {
  @consume({ context: roomContext, subscribe: true })
  @state()
  room?: RoomState;

  override render() {
    return html` <div>Current Room: ${this.room?.title || this.room?.name || "None"}</div> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-current-room": CurrentRoom;
  }
}
