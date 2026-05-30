import { consume } from "@lit/context";
import { html, LitElement, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { isGuest } from "../../guards/access";
import type { User } from "../../interfaces/user.interface";
import { userContext } from "../../providers/user.provider";
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

  protected override willUpdate(changed: PropertyValues<this>): void {
    // Prefill the input with the room id coming from the route (if any).
    if (changed.has("roomId") && this.roomId) {
      this.value = this.roomId;
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    socketService.socket.on("join-request-admitted", this.handleAdmitted);
    socketService.socket.on("join-request-denied", this.handleDenied);
  }

  override disconnectedCallback(): void {
    socketService.socket.off("join-request-admitted", this.handleAdmitted);
    socketService.socket.off("join-request-denied", this.handleDenied);
    super.disconnectedCallback();
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
        userKey: this.user?.key,
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

  private handleJoin(e: Event) {
    e.preventDefault();
    const id = this.validateRoomId();
    if (!id) return;

    this.navigate(`/voice/${encodeURIComponent(id)}`);
  }

  private renderForm({
    title,
    subtitle,
    buttonLabel,
    onSubmit,
    waiting = false,
  }: {
    title: string;
    subtitle: TemplateResult;
    buttonLabel: string;
    onSubmit: (e: Event) => void;
    waiting?: boolean;
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

                <ui-button type="submit">${buttonLabel}</ui-button>
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

    return this.renderForm({
      title: "Join a room",
      subtitle: html`Hey ${name}, enter a room code below to join the
      conversation.`,
      buttonLabel: "Join",
      onSubmit: this.handleJoin,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "join-page": JoinPage;
  }
}
