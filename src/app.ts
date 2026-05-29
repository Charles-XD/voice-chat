import { provide } from "@lit/context";
import { Task } from "@lit/task";
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import styles from "./app.styles";
import { type RoomState, roomContext } from "./components/app/_context/room.context";
import { logger } from "./components/app/_services/logger.service";
import { socketService } from "./components/app/_services/socket.service";
import { canJoinRoom } from "./api";

@customElement("voice-app")
export class App extends LitElement {
  static styles = styles;

  /** Room to join, taken from the /voice/:roomId route. */
  @property() roomId = "";

  @provide({ context: roomContext })
  @state()
  private room: RoomState = {
    name: "",
  };

  // Validates the user can join, then joins the room. Re-runs if roomId changes.
  private _joinTask = new Task(this, {
    task: async ([roomId], { signal }) => {
      if (!roomId) throw new Error("MISSING_ROOM_ID");

      const allowed = await canJoinRoom(roomId, signal);
      if (!allowed) throw new Error("FORBIDDEN");

      await socketService.joinRoom(roomId);

      this.room = { name: roomId };
      logger.clear();
      logger.log("SUCCESS", `Joined the room (${roomId}).`);

      return roomId;
    },
    args: () => [this.roomId],
  });

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener("room-change", this.handleRoomChange as EventListener);
  }

  disconnectedCallback() {
    this.removeEventListener("room-change", this.handleRoomChange as EventListener);

    super.disconnectedCallback();
  }

  private handleRoomChange = (e: CustomEvent<{ name: string }>) => {
    this.room = {
      ...this.room,
      name: e.detail.name,
    };
  };

  private goBack() {
    this.dispatchEvent(
      new CustomEvent("navigate", { detail: "/join", bubbles: true, composed: true }),
    );
  }

  private renderRoom() {
    return html`
      <div class="layout">
        <div class="main">
          <app-mute-button></app-mute-button>
          <app-room-join></app-room-join>
          <app-current-room></app-current-room>
          <app-online-users-global></app-online-users-global>
        </div>

        <div class="logs">
          <app-logs></app-logs>
        </div>
      </div>
    `;
  }

  override render() {
    return this._joinTask.render({
      pending: () => html`<div class="status">Joining room…</div>`,
      complete: () => this.renderRoom(),
      error: (error) => {
        const message =
          error instanceof Error && error.message === "FORBIDDEN"
            ? "You don't have access to this room."
            : "We couldn't join this room. Please try again.";

        return html`
          <div class="status error">
            <p>${message}</p>
            <ui-button color="secondary" @onClick=${this.goBack}>Back to Join</ui-button>
          </div>
        `;
      },
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "voice-app": App;
  }
}
