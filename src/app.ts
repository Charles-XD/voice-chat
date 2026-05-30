import { consume, provide } from "@lit/context";
import { Task } from "@lit/task";
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { canJoinRoom } from "./api";
import styles from "./app.styles";
import { type CallApi, callContext } from "./components/app/_context/call.context";
import { type RoomState, roomContext } from "./components/app/_context/room.context";
import { logger } from "./components/app/_services/logger.service";
import type { User } from "./interfaces/user.interface";
import { userContext } from "./providers/user.provider";

@customElement("voice-app")
export class App extends LitElement {
  static styles = styles;

  @property() roomId = "";

  @consume({ context: userContext, subscribe: true })
  private user?: User | null;

  @consume({ context: callContext, subscribe: true })
  @state()
  private call?: CallApi;

  @provide({ context: roomContext })
  @state()
  private room: RoomState = {
    name: "",
  };

  private _joinTask = new Task(this, {
    task: async ([roomId, key], { signal }) => {
      if (!roomId) throw new Error("MISSING_ROOM_ID");

      const { allowed, room } = await canJoinRoom(roomId, key, signal);
      if (!allowed) throw new Error("FORBIDDEN");

      // The call provider is the single source of truth and persists across
      // navigation, so "returning" means it already holds this very room.
      const call = this.call;
      const returning = call?.active === true && call.roomId === roomId;
      const muted = returning ? call.muted : true;

      const title = room?.name ?? roomId;
      this.room = {
        name: roomId,
        title,
        isPublic: room?.isPublic,
        creatorId: room?.creatorId,
        allowed: room?.allowed ?? [],
        users: room?.users ?? [],
      };

      // Provider handles mic capture, the socket join, and WebRTC peers.
      await this.call?.start({ roomId, title, name: this.user?.name, muted });

      if (!returning) {
        logger.clear();
        logger.log("SUCCESS", `Joined the room (${title}).`);
      }

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

  @state() private panelCollapsed = false;

  private togglePanel() {
    this.panelCollapsed = !this.panelCollapsed;
  }

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
      <div class="layout ${this.panelCollapsed ? "panel-collapsed" : ""}">
        <button
          class="panel-toggle ${this.panelCollapsed ? "is-collapsed" : ""}"
          type="button"
          @click=${this.togglePanel}
          aria-expanded=${!this.panelCollapsed}
          aria-label=${this.panelCollapsed ? "Show side panel" : "Hide side panel"}
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="4" width="18" height="16" rx="2"></rect>
            <line x1="15" y1="4" x2="15" y2="20"></line>
          </svg>
        </button>

        <div class="main">
          <app-current-room></app-current-room>
          <app-room-actions></app-room-actions>
          <app-room-manage></app-room-manage>
          <app-room-users></app-room-users>
        </div>

        <div class="logs">
          <app-room-share></app-room-share>
          <app-room-chat></app-room-chat>
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
