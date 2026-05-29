import { consume } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRoom } from "../../../../api";
import type { User } from "../../../../interfaces/user.interface";
import { userContext } from "../../../../providers/user.provider";

import styles from "./styles";

@customElement("app-room-create")
export class RoomCreate extends LitElement {
  static styles = styles;

  @consume({ context: userContext, subscribe: true })
  @state()
  user?: User | null;

  @state() private roomTitle = "";
  @state() private error = "";
  @state() private submitting = false;

  private handleChange(e: CustomEvent<string>) {
    this.roomTitle = e.detail;
    if (this.error) this.error = "";
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

  private async handleSubmit(e: Event) {
    e.preventDefault();

    const title = this.roomTitle.trim();
    if (!title) {
      this.error = "Room title is required.";
      return;
    }
    if (!this.user?.key) {
      this.error = "You need an account to create a room.";
      return;
    }

    this.submitting = true;
    try {
      const room = await createRoom(this.user.key, title);
      this.navigate(`/voice/${encodeURIComponent(room.id)}`);
    } catch {
      this.error = "Could not create the room. Please try again.";
    } finally {
      this.submitting = false;
    }
  }

  render() {
    return html`
      <div class="card">
        <h1 class="title">Create a room</h1>
        <p class="subtitle">
          Give your room a title to start talking. A private room is created and
          you can invite others once you're inside.
        </p>

        <form @submit=${this.handleSubmit} novalidate>
          <ui-textfield
            label="Room title"
            placeholder="e.g. Design sync"
            required
            .value=${this.roomTitle}
            .error=${this.error}
            @onChange=${this.handleChange}
          ></ui-textfield>

          <ui-button type="submit" ?loading=${this.submitting}>Create Room</ui-button>
        </form>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-room-create": RoomCreate;
  }
}
