import { consume } from "@lit/context";
import { html, LitElement, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { canJoinRoom } from "../../api";
import { hasKey, isGuest } from "../../guards/access";
import type { User } from "../../interfaces/user.interface";
import { userContext, GUEST_SESSION_KEY } from "../../providers/user.provider";
import { socketService } from "../../components/app/_services/socket.service";

import styles from "./styles";

type JoinRequestAck = {
  success?: boolean;
  admitted?: boolean;
  waiting?: boolean;
  error?: string;
};

@customElement("join-page")
export class JoinPage extends LitElement {
  static styles = styles;

  @property() roomId = "";

  @consume({ context: userContext, subscribe: true })
  user?: User | null;

  @state() private value = "";
  @state() private error = "";
  @state() private waiting = false;
  @state() private waitingRoomId = "";
  @state() private requestMode = false;
  @state() private checking = false;

  private accessCheckAbort?: AbortController;

  protected override willUpdate(changed: PropertyValues<this>): void {
    // Prefill the input with the room id coming from the route (if any).
    if (changed.has("roomId") && this.roomId) {
      this.value = this.roomId;
    }

    if (
      (changed.has("roomId") || changed.has("user")) &&
      hasKey(this.user) &&
      this.value.trim()
    ) {
      this.scheduleAccessCheck(this.value.trim());
    }
  }

  override disconnectedCallback(): void {
    this.accessCheckAbort?.abort();
    socketService.socket.off("join-request-admitted", this.handleAdmitted);
    socketService.socket.off("join-request-denied", this.handleDenied);
    super.disconnectedCallback();
  }

  private scheduleAccessCheck(roomId: string) {
    this.accessCheckAbort?.abort();
    const controller = new AbortController();
    this.accessCheckAbort = controller;

    const key = this.user?.key;
    if (!key) return;

    void canJoinRoom(roomId, key, controller.signal).then(({ allowed, room }) => {
      if (controller.signal.aborted) return;
      this.requestMode = !allowed && Boolean(room);
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    socketService.socket.on("join-request-admitted", this.handleAdmitted);
    socketService.socket.on("join-request-denied", this.handleDenied);
  }

  private navigate(url: string) {
    this.dispatchEvent(
      new CustomEvent("navigate", {
        detail: url,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleAdmitted = (detail: { room: string }) => {
    if (!detail?.room) return;
    if (this.waitingRoomId && detail.room !== this.waitingRoomId) return;
    this.navigate(`/voice/${encodeURIComponent(detail.room)}`);
  };

  private handleDenied = (detail: { room: string }) => {
    if (this.waitingRoomId && detail.room !== this.waitingRoomId) return;
    this.waiting = false;
    this.waitingRoomId = "";
    this.error = "The host declined your request to join.";
  };

  private handleChange(e: CustomEvent<string>) {
    this.value = e.detail;
    if (this.error) this.error = "";
    this.requestMode = false;
  }

  private validateRoomId(): string | null {
    const id = this.value.trim();
    if (id.length === 0) {
      this.error = "Room code is required.";
      return null;
    }
    this.error = "";
    return id;
  }

  private joinRequestKey(): string | undefined {
    if (this.user?.key) return this.user.key;
    if (!isGuest(this.user)) return undefined;

    let key = sessionStorage.getItem(GUEST_SESSION_KEY);
    if (!key) {
      key = `guest-${crypto.randomUUID()}`;
      sessionStorage.setItem(GUEST_SESSION_KEY, key);
    }
    return key;
  }

  private async handleRequest(e: Event) {
    e.preventDefault();
    const id = this.validateRoomId();
    if (!id) return;

    try {
      await socketService.whenConnected();
    } catch {
      this.error = "Could not connect to the server. Try again.";
      return;
    }

    socketService.socket.emit(
      "join-request",
      {
        room: id,
        name: this.user?.name ?? "Guest",
        userKey: this.joinRequestKey(),
      },
      (ack: JoinRequestAck) => {
        if (ack?.admitted) {
          this.navigate(`/voice/${encodeURIComponent(id)}`);
          return;
        }
        if (ack?.waiting) {
          this.waiting = true;
          this.waitingRoomId = id;
          this.error = "";
          return;
        }
        this.error =
          ack?.error === "NOT_FOUND"
            ? "That room does not exist."
            : "Could not send your join request.";
      },
    );
  }

  private async handleJoin(e: Event) {
    e.preventDefault();
    const id = this.validateRoomId();
    if (!id) return;

    const key = this.user?.key;
    if (!hasKey(this.user) || !key) {
      this.navigate(`/voice/${encodeURIComponent(id)}`);
      return;
    }

    this.checking = true;
    try {
      const { allowed, room } = await canJoinRoom(id, key);
      if (allowed) {
        this.navigate(`/voice/${encodeURIComponent(id)}`);
        return;
      }
      if (room) {
        this.requestMode = true;
        this.error = "";
        return;
      }
      this.error = "That room does not exist.";
    } catch {
      this.error = "Could not verify room access. Try again.";
    } finally {
      this.checking = false;
    }
  }

  private renderForm({
    title,
    subtitle,
    buttonLabel,
    onSubmit,
    waiting = false,
    submitDisabled = false,
  }: {
    title: string;
    subtitle: TemplateResult;
    buttonLabel: string;
    onSubmit: (e: Event) => void;
    waiting?: boolean;
    submitDisabled?: boolean;
  }) {
    return html`
      <div class="card">
        <h1 class="title">${title}</h1>
        <p class="subtitle">${subtitle}</p>

        ${
          waiting
            ? html`<div class="waiting">
                <p class="waiting-text">Waiting for the host to admit you…</p>
                <p class="waiting-room">Room: ${this.waitingRoomId}</p>
              </div>`
            : html`<form @submit=${onSubmit} novalidate>
                <ui-textfield
                  label="Room code"
                  placeholder="Enter a room code"
                  required
                  .value=${this.value}
                  .error=${this.error}
                  @onChange=${this.handleChange}
                ></ui-textfield>

                <ui-button type="submit" ?disabled=${submitDisabled}
                  >${buttonLabel}</ui-button
                >
              </form>`
        }
      </div>
    `;
  }

  override render() {
    const name = this.user?.name ?? "there";

    if (isGuest(this.user)) {
      return this.renderForm({
        title: "Request to join",
        subtitle: html`Hey ${name}, request to join the conversation. The host will
        need to admit you before you can enter.`,
        buttonLabel: "Request to join",
        onSubmit: this.handleRequest,
        waiting: this.waiting,
      });
    }

    if (this.requestMode || this.waiting) {
      return this.renderForm({
        title: "Request to join",
        subtitle: html`Hey ${name}, you don't have access to this room yet. The
        host will need to admit you before you can enter.`,
        buttonLabel: "Request to join",
        onSubmit: this.handleRequest,
        waiting: this.waiting,
      });
    }

    return this.renderForm({
      title: "Join a room",
      subtitle: html`Hey ${name}, enter a room code below to join the
      conversation.`,
      buttonLabel: this.checking ? "Checking…" : "Join",
      onSubmit: this.handleJoin,
      submitDisabled: this.checking,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "join-page": JoinPage;
  }
}
