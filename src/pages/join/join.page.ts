import { consume } from "@lit/context";
import { html, LitElement, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { isGuest } from "../../guards/access";
import type { User } from "../../interfaces/user.interface";
import { userContext } from "../../providers/user.provider";

import styles from "./styles";

@customElement("join-page")
export class JoinPage extends LitElement {
  static styles = styles;

  @property() roomId = "";

  @consume({ context: userContext, subscribe: true })
  user?: User | null;

  @state() private value = "";
  @state() private error = "";

  protected override willUpdate(changed: PropertyValues<this>): void {
    // Prefill the input with the room id coming from the route (if any).
    if (changed.has("roomId") && this.roomId) {
      this.value = this.roomId;
    }
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

  private handleRequest(e: Event) {
    e.preventDefault();
    const id = this.validateRoomId();
    if (!id) return;

    // TODO: send a join request and wait for host admission.
    this.navigate(`/voice/${encodeURIComponent(id)}`);
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
  }: {
    title: string;
    subtitle: TemplateResult;
    buttonLabel: string;
    onSubmit: (e: Event) => void;
  }) {
    return html`
      <div class="card">
        <h1 class="title">${title}</h1>
        <p class="subtitle">${subtitle}</p>

        <form @submit=${onSubmit} novalidate>
          <ui-textfield
            label="Room code"
            placeholder="Enter a room code"
            required
            .value=${this.value}
            .error=${this.error}
            @onChange=${this.handleChange}
          ></ui-textfield>

          <ui-button type="submit">${buttonLabel}</ui-button>
        </form>
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
