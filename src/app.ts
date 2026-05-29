import { consume, provide } from "@lit/context";
import { Task } from "@lit/task";
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { canJoinRoom } from "./api";
import styles from "./app.styles";
import { type RoomState, roomContext } from "./components/app/_context/room.context";
import { logger } from "./components/app/_services/logger.service";
import { socketService } from "./components/app/_services/socket.service";
import type { User } from "./interfaces/user.interface";
import { userContext } from "./providers/user.provider";

@customElement("voice-app")
export class App extends LitElement {
  static styles = styles;

  /** Room to join, taken from the /voice/:roomId route. */
  @property() roomId = "";

  @consume({ context: userContext, subscribe: true })
  private user?: User | null;

  @provide({ context: roomContext })
  @state()
  private room: RoomState = {
    name: "",
  };

  // Validates the user can join, then joins the room. Re-runs if roomId changes.
  private _joinTask = new Task(this, {
    task: async ([roomId, key], { signal }) => {
      if (!roomId) throw new Error("MISSING_ROOM_ID");

      const { allowed, room } = await canJoinRoom(roomId, key, signal);
      if (!allowed) throw new Error("FORBIDDEN");

      await socketService.joinRoom(roomId, this.user?.name);

      this.room = {
        name: roomId,
        title: room?.name ?? roomId,
        isPublic: room?.isPublic,
        creatorId: room?.creatorId,
        allowed: room?.allowed ?? [],
        users: room?.users ?? [],
      };
      logger.clear();
      logger.log("SUCCESS", `Joined the room (${this.room.title}).`);

      return roomId;
    },
    args: () => [this.roomId, this.user?.key] as const,
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
      new CustomEvent("navigate", {
        detail: "/join",
        bubbles: true,
        composed: true,
      }),
    );
  }

  private renderRoom() {
    return html`
      <div class="layout">
        <div class="main">
          <app-current-room></app-current-room>
          <app-room-actions></app-room-actions>
          <app-room-manage></app-room-manage>
          <app-room-users></app-room-users>
          <app-room-chat></app-room-chat>
        </div>

        <div class="logs">
          <app-room-share></app-room-share>
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
            <ui-button color="secondary" @onClick=${this.goBack}
              >Back to Join</ui-button
            >
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
