import { consume } from "@lit/context";
import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { User } from "../../../../interfaces/user.interface";
import { userContext } from "../../../../providers/user.provider";
import { type RoomState, roomContext } from "../../_context/room.context";
import { socketService } from "../../_services/socket.service";

import styles from "./styles";

type ChatMessage = { id?: string; from: string; message: string; time: string };

@customElement("app-room-chat")
export class RoomChat extends LitElement {
  static styles = styles;

  @consume({ context: roomContext, subscribe: true })
  @state()
  room?: RoomState;

  @consume({ context: userContext, subscribe: true })
  @state()
  user?: User | null;

  @state() private messages: ChatMessage[] = [];
  @state() private draft = "";
  @state() private collapsed = false;

  private currentRoom?: string;

  private get selfId(): string | undefined {
    return socketService.socket.id;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    socketService.socket.on("chat-message", this.handleMessage);
  }

  override disconnectedCallback(): void {
    socketService.socket.off("chat-message", this.handleMessage);
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    // Reset the transcript when we switch rooms.
    if (changed.has("room") && this.room?.name !== this.currentRoom) {
      this.currentRoom = this.room?.name;
      this.messages = [];
    }
  }

  protected override updated(): void {
    const list = this.renderRoot.querySelector(".messages");
    if (list) list.scrollTop = list.scrollHeight;
  }

  private toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  private handleMessage = (data: ChatMessage) => {
    this.messages = [...this.messages, data];
  };

  private autoGrow(textarea: HTMLTextAreaElement) {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 92)}px`;
  }

  private handleInput(e: Event) {
    const textarea = e.target as HTMLTextAreaElement;
    this.draft = textarea.value;
    this.autoGrow(textarea);
  }

  private handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      this.send();
    }
  }

  private send() {
    const text = this.draft.trim();
    if (!text) return;
    socketService.socket.emit("chat-message", text);
    this.draft = "";

    const textarea = this.renderRoot.querySelector(".field") as HTMLTextAreaElement | null;
    if (textarea) textarea.style.height = "auto";
  }

  private handleSubmit(e: Event) {
    e.preventDefault();
    this.send();
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

  override render() {
    return html`
      <div class="chat ${this.collapsed ? "collapsed" : ""}">
        <div class="head">
          <h2 class="title">Chat</h2>
          <button
            class="toggle ${this.collapsed ? "is-collapsed" : ""}"
            type="button"
            @click=${this.toggleCollapse}
            aria-expanded=${!this.collapsed}
            aria-label=${this.collapsed ? "Expand chat" : "Collapse chat"}
          >
            ${this.renderToggleIcon()}
          </button>
        </div>

        ${
          this.collapsed
            ? nothing
            : html`
              <div class="messages">
                ${
                  this.messages.length
                    ? this.messages.map((m) => {
                        const mine = Boolean(m.id && m.id === this.selfId);
                        return html`<div class="msg ${mine ? "mine" : ""}">
                          <div class="meta">
                            <span class="from">${mine ? "You" : m.from}</span>
                            <span class="time">${m.time}</span>
                          </div>
                          <div class="bubble">${m.message}</div>
                        </div>`;
                      })
                    : html`<p class="empty">No messages yet. Say hi!</p>`
                }
              </div>

              <form class="composer" @submit=${this.handleSubmit} novalidate>
                <textarea
                  class="field"
                  rows="1"
                  placeholder="Type a message…"
                  .value=${this.draft}
                  @input=${this.handleInput}
                  @keydown=${this.handleKeydown}
                ></textarea>
                <ui-button type="submit">Send</ui-button>
              </form>
            `
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-room-chat": RoomChat;
  }
}
