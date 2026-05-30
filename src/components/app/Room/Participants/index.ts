import { consume } from "@lit/context";
import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import type { JoinRequest, RoomMember } from "../../../../api";
import type { User } from "../../../../interfaces/user.interface";
import { userContext } from "../../../../providers/user.provider";
import { type CallApi, callContext } from "../../_context/call.context";
import { type RoomState, roomContext } from "../../_context/room.context";
import { socketService } from "../../_services/socket.service";

import styles from "./styles";

type JoinEvent = { room: string; user: RoomMember };
type LeaveEvent = { room: string; user: string };
type MicEvent = { user: string; muted: boolean };
type ScreenEvent = { user: string; sharing: boolean };
type CameraEvent = { user: string; cameraOn: boolean };
type JoinRequestsEvent = { room: string; requests: JoinRequest[] };

@customElement("app-room-participants")
export class RoomParticipants extends LitElement {
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
  @state() private pendingRequests: JoinRequest[] = [];
  @state() private collapsed = false;

  private requestedRoom?: string;
  private lastCallRenderKey = "";

  private get selfId(): string | undefined {
    return socketService.socket.id;
  }

  private get isHost(): boolean {
    return Boolean(this.user?.key && this.room?.creatorId && this.user.key === this.room.creatorId);
  }

  private callRenderKey(call: CallApi | undefined): string {
    if (!call) return "";
    return [call.speaking.join(","), call.muted, call.sharing, call.cameraOn].join("|");
  }

  protected override shouldUpdate(changed: PropertyValues<this>): boolean {
    if (changed.has("call")) {
      const key = this.callRenderKey(this.call);
      if (key === this.lastCallRenderKey) return changed.size > 1;
      this.lastCallRenderKey = key;
    }
    return true;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    socketService.socket.on("all-clients", this.handleAllClients);
    socketService.socket.on("user-join-room", this.handleUserJoin);
    socketService.socket.on("user-leave-room", this.handleUserLeave);
    socketService.socket.on("mic-status", this.handleMicStatus);
    socketService.socket.on("screen-status", this.handleScreenStatus);
    socketService.socket.on("camera-status", this.handleCameraStatus);
    socketService.socket.on("join-requests", this.handleJoinRequests);
  }

  override disconnectedCallback(): void {
    socketService.socket.off("all-clients", this.handleAllClients);
    socketService.socket.off("user-join-room", this.handleUserJoin);
    socketService.socket.off("user-leave-room", this.handleUserLeave);
    socketService.socket.off("mic-status", this.handleMicStatus);
    socketService.socket.off("screen-status", this.handleScreenStatus);
    socketService.socket.off("camera-status", this.handleCameraStatus);
    socketService.socket.off("join-requests", this.handleJoinRequests);
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("room") && this.room?.name && this.room.name !== this.requestedRoom) {
      this.requestedRoom = this.room.name;
      this.members = this.withSelf(this.room.users ?? []);
      this.pendingRequests = [];
      this.refreshMembers(this.room.name);
    }
  }

  private refreshMembers(room: string): void {
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
      cameraOn: this.call?.cameraOn ?? false,
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
    }
  };

  private handleUserLeave = (detail: LeaveEvent) => {
    if (!this.isForThisRoom(detail.room)) return;
    this.members = this.members.filter((m) => m.id !== detail.user);
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

  private handleCameraStatus = (detail: CameraEvent) => {
    this.members = this.members.map((m) =>
      m.id === detail.user ? { ...m, cameraOn: detail.cameraOn } : m,
    );
  };

  private handleJoinRequests = (detail: JoinRequestsEvent) => {
    if (!this.isForThisRoom(detail.room)) return;
    this.pendingRequests = detail.requests ?? [];
  };

  private toggleCollapse(): void {
    this.collapsed = !this.collapsed;
  }

  private admitRequest(requestId: string): void {
    const room = this.room?.name;
    if (!room) return;
    socketService.socket.emit("join-request-admit", { room, requestId });
  }

  private denyRequest(requestId: string): void {
    const room = this.room?.name;
    if (!room) return;
    socketService.socket.emit("join-request-deny", { room, requestId });
  }

  private initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  private isSpeaking(member: RoomMember): boolean {
    return !member.muted && (this.call?.speaking?.includes(member.id) ?? false);
  }

  private orderedMembers(): RoomMember[] {
    const id = this.selfId;
    return [...this.members].sort((a, b) => {
      if (id) {
        if (a.id === id) return -1;
        if (b.id === id) return 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  private renderToggleIcon() {
    return html`<svg
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
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>`;
  }

  private renderMicIcon(muted: boolean) {
    if (muted) {
      return html`<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="2" y1="2" x2="22" y2="22"></line>
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6"></path>
      </svg>`;
    }
    return html`<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    </svg>`;
  }

  private renderScreenIcon() {
    return html`<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2"></rect>
    </svg>`;
  }

  private renderCameraIcon() {
    return html`<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M23 7l-7 5 7 5V7z"></path>
      <rect x="1" y="5" width="15" height="14" rx="2"></rect>
    </svg>`;
  }

  private renderMemberBadges(member: RoomMember) {
    return html`
      <span class="badge ${member.muted ? "muted" : "live"}" title=${member.muted ? "Muted" : "Mic on"}>
        ${this.renderMicIcon(member.muted)}
      </span>
      ${member.sharing
        ? html`<span class="badge media" title="Sharing screen">${this.renderScreenIcon()}</span>`
        : member.cameraOn
          ? html`<span class="badge media" title="Camera on">${this.renderCameraIcon()}</span>`
          : nothing}
    `;
  }

  override render() {
    const members = this.orderedMembers();
    const showRequests = this.isHost && this.pendingRequests.length > 0;

    return html`
      <div class="panel ${this.collapsed ? "collapsed" : ""}">
        <div class="head">
          <div class="title-wrap">
            <h2 class="title">Participants</h2>
            <span class="count">${members.length}</span>
          </div>
          <button
            class="toggle ${this.collapsed ? "is-collapsed" : ""}"
            type="button"
            @click=${this.toggleCollapse}
            aria-expanded=${!this.collapsed}
            aria-label=${this.collapsed ? "Expand participants" : "Collapse participants"}
          >
            ${this.renderToggleIcon()}
          </button>
        </div>

        ${
          this.collapsed
            ? nothing
            : html`<div class="body">
                ${
                  showRequests
                    ? html`<section class="requests">
                        <h3 class="requests-title">Join requests (${this.pendingRequests.length})</h3>
                        <ul class="request-list">
                          ${repeat(
                            this.pendingRequests,
                            (r) => r.requestId,
                            (request) => html`<li class="request">
                              <div class="request-info">
                                <span class="request-name">${request.name}</span>
                                ${
                                  request.userKey
                                    ? html`<span class="request-key">${request.userKey.slice(0, 8)}…</span>`
                                    : nothing
                                }
                              </div>
                              <div class="request-actions">
                                <ui-button color="primary" @onClick=${() => this.admitRequest(request.requestId)}
                                  >Admit</ui-button
                                >
                                <ui-button color="secondary" @onClick=${() => this.denyRequest(request.requestId)}
                                  >Deny</ui-button
                                >
                              </div>
                            </li>`,
                          )}
                        </ul>
                      </section>`
                    : nothing
                }

                <div class="members">
                  ${
                    members.length
                      ? repeat(
                          members,
                          (m) => m.id,
                          (member) => {
                            const isSelf = member.id === this.selfId;
                            const speaking = this.isSpeaking(member);
                            return html`<div class="member ${speaking ? "speaking" : ""}">
                              <div class="avatar">${this.initials(member.name)}</div>
                              <div class="member-main">
                                <span class="member-name">
                                  ${member.name}${isSelf ? html`<span class="member-you"> (you)</span>` : nothing}
                                </span>
                              </div>
                              <div class="badges">${this.renderMemberBadges(member)}</div>
                            </div>`;
                          },
                        )
                      : html`<p class="empty">No one is here yet.</p>`
                  }
                </div>
              </div>`
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-room-participants": RoomParticipants;
  }
}
