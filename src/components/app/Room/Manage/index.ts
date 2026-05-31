import { consume } from "@lit/context";
import { html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { allowUser } from "../../../../api";
import type { User } from "../../../../interfaces/user.interface";
import { userContext } from "../../../../providers/user.provider";
import { type RoomState, roomContext } from "../../_context/room.context";

import styles from "./styles";

@customElement("app-room-manage")
export class RoomManage extends LitElement {
  static styles = styles;

  @consume({ context: roomContext, subscribe: true })
  @state()
  room?: RoomState;

  @consume({ context: userContext, subscribe: true })
  @state()
  user?: User | null;

  @state() private value = "";
  @state() private error = "";
  @state() private submitting = false;

  private get isOwner(): boolean {
    return Boolean(this.user?.key && this.room?.creatorId && this.user.key === this.room.creatorId);
  }

  private handleChange(e: CustomEvent<string>) {
    this.value = e.detail;
    if (this.error) this.error = "";
  }

  private async handleAllow(e: Event) {
    e.preventDefault();

    const userId = this.value.trim();
    if (!userId) {
      this.error = "Enter a user key to allow.";
      return;
    }
    if (!this.user?.key || !this.room?.name) return;

    this.submitting = true;
    try {
      const updated = await allowUser(this.room.name, this.user.key, userId);
      this.room = { ...this.room, allowed: updated.allowed };
      this.value = "";
    } catch {
      this.error = "Could not allow that user.";
    } finally {
      this.submitting = false;
    }
  }

  override render() {
    if (!this.isOwner) return nothing;

    const allowed = this.room?.allowed ?? [];

    return html`
      <div class="manage">
        <h3 class="heading">Invite to this room</h3>

        ${
          this.room?.isPublic
            ? html`<p class="subtitle">This room is public — anyone with the link can join.</p>`
            : html`
              <p class="subtitle">
                This room is private. Allow a user by their key so they can join.
              </p>

              <form @submit=${this.handleAllow} novalidate>
                <ui-textfield
                  class="field"
                  label="User key"
                  placeholder="Enter a user key"
                  required
                  .value=${this.value}
                  .error=${this.error}
                  @onChange=${this.handleChange}
                ></ui-textfield>
                <ui-button type="submit" ?loading=${this.submitting}>Allow</ui-button>
              </form>

              ${
                allowed.length
                  ? html`<ul class="allowed">
                    ${allowed.map((id) => html`<li>${id}</li>`)}
                  </ul>`
                  : html`<p class="empty">No one allowed yet.</p>`
              }
            `
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-room-manage": RoomManage;
  }
}
