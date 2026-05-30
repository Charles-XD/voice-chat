import { consume } from "@lit/context";
import { html, LitElement, type PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { RoomMember } from "../../../../api";
import type { User } from "../../../../interfaces/user.interface";
import { userContext } from "../../../../providers/user.provider";
import { type CallApi, callContext } from "../../_context/call.context";
import { type RoomState, roomContext } from "../../_context/room.context";
import { logger } from "../../_services/logger.service";
import { socketService } from "../../_services/socket.service";

import styles from "./styles";

type JoinEvent = { room: string; user: RoomMember };
type LeaveEvent = { room: string; user: string };
type MicEvent = { user: string; muted: boolean };
type ScreenEvent = { user: string; sharing: boolean };

@customElement("app-room-users")
export class RoomUsers extends LitElement {
  static styles = styles;

  @consume({ context: roomContext, subscribe: true })
  @state()
  room?: RoomState;

  @consume({ context: userContext, subscribe: true })
  @state()
  user?: User | null;

  @consume({ context: callContext, subscribe: true })
  @state()
  call?: CallApi;

  @state() private members: RoomMember[] = [];

  private requestedRoom?: string;

  private get selfId(): string | undefined {
    return socketService.socket.id;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    socketService.socket.on("all-clients", this.handleAllClients);
    socketService.socket.on("user-join-room", this.handleUserJoin);
    socketService.socket.on("user-leave-room", this.handleUserLeave);
    socketService.socket.on("mic-status", this.handleMicStatus);
    socketService.socket.on("screen-status", this.handleScreenStatus);
  }

  override disconnectedCallback(): void {
    socketService.socket.off("all-clients", this.handleAllClients);
    socketService.socket.off("user-join-room", this.handleUserJoin);
    socketService.socket.off("user-leave-room", this.handleUserLeave);
    socketService.socket.off("mic-status", this.handleMicStatus);
    socketService.socket.off("screen-status", this.handleScreenStatus);
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("room") && this.room?.name && this.room.name !== this.requestedRoom) {
      this.requestedRoom = this.room.name;
      // Seed instantly from the REST snapshot, then pull the authoritative
      // roster (mute states included) to avoid racing the join broadcast.
      this.members = this.withSelf(this.room.users ?? []);
      this.refreshMembers(this.room.name);
    }
  }

  private refreshMembers(room: string) {
    socketService.socket.emit("get-members", room, (members: RoomMember[]) => {
      if (Array.isArray(members)) this.members = this.withSelf(members);
    });
  }

  private selfMember(): RoomMember | null {
    const id = this.selfId;
    if (!id) return null;
    return {
      id,
      name: this.user?.name ?? id.slice(0, 6),
      muted: this.call?.muted ?? true,
      sharing: this.call?.sharing ?? false,
    };
  }

  private withSelf(members: RoomMember[]): RoomMember[] {
    const self = this.selfMember();
    if (!self || members.some((m) => m.id === self.id)) return members;
    return [...members, self];
  }

  private isForThisRoom(room: string): boolean {
    return !this.room?.name || room === this.room.name;
  }

  private handleAllClients = (clients: RoomMember[]) => {
    this.members = this.withSelf(clients);
  };

  private handleUserJoin = (detail: JoinEvent) => {
    if (!this.isForThisRoom(detail.room)) return;
    if (!this.members.some((m) => m.id === detail.user.id)) {
      this.members = [...this.members, detail.user];
      logger.log("INFO", `${detail.user.name} joined the room.`);
    }
  };

  private handleUserLeave = (detail: LeaveEvent) => {
    if (!this.isForThisRoom(detail.room)) return;
    const leaving = this.members.find((m) => m.id === detail.user);
    this.members = this.members.filter((m) => m.id !== detail.user);
    if (leaving) {
      logger.log("INFO", `${leaving.name} left the room.`);
    }
  };

  private handleMicStatus = (detail: MicEvent) => {
    this.members = this.members.map((m) =>
      m.id === detail.user ? { ...m, muted: detail.muted } : m,
    );
  };

  private handleScreenStatus = (detail: ScreenEvent) => {
    this.members = this.members.map((m) =>
      m.id === detail.user ? { ...m, sharing: detail.sharing } : m,
    );
  };

  private screenStream(id: string): MediaStream | undefined {
    return this.call?.screens.find((s) => s.id === id)?.stream;
  }

  private isSharing(member: RoomMember): boolean {
    return Boolean(member.sharing || this.screenStream(member.id));
  }

  private initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  private renderMic(muted: boolean) {
    if (muted) {
      return html`<span class="mic muted" title="Muted" aria-label="Muted">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="2" y1="2" x2="22" y2="22"></line>
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6"></path>
          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
        </svg>
      </span>`;
    }

    return html`<span class="mic live" title="Mic on" aria-label="Mic on">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    </span>`;
  }

  private orderedMembers(): RoomMember[] {
    const id = this.selfId;
    return [...this.members].sort((a, b) => {
      const aShare = this.isSharing(a);
      const bShare = this.isSharing(b);
      if (aShare && !bShare) return -1;
      if (!aShare && bShare) return 1;
      if (id) {
        if (a.id === id) return -1;
        if (b.id === id) return 1;
      }
      return 0;
    });
  }

  private renderMedia(member: RoomMember) {
    const stream = this.screenStream(member.id);
    if (stream) {
      return html`<div class="media">
        <video autoplay playsinline muted .srcObject=${stream}></video>
      </div>`;
    }

    return html`<div class="avatar">${this.initials(member.name)}</div>`;
  }

  protected override updated(): void {
    this.renderRoot.querySelectorAll("video").forEach((el) => {
      void (el as HTMLVideoElement).play().catch(() => {});
    });
  }

  override render() {
    return html`
      <header class="head">
        <h2 class="title">In this room</h2>
        <span class="count">${this.members.length}</span>
      </header>

      ${
        this.members.length
          ? html`<div class="grid">
              ${this.orderedMembers().map((m) => {
                const isSelf = m.id === this.selfId;
                const sharing = this.isSharing(m);
                const speaking = !m.muted && (this.call?.speaking?.includes(m.id) ?? false);
                return html`<div class="cell ${sharing ? "sharing" : ""} ${speaking ? "speaking" : ""}">
                  ${this.renderMedia(m)}
                  <span class="name">${m.name}${isSelf ? " (you)" : ""}</span>
                  ${this.renderMic(m.muted)}
                </div>`;
              })}
            </div>`
          : html`<p class="empty">No one is here yet.</p>`
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-room-users": RoomUsers;
  }
}
