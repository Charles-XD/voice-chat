import { consume } from "@lit/context";
import { html, LitElement, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { type RoomState, roomContext } from "../../_context/room.context";

import styles from "./styles";

@customElement("app-room-share")
export class RoomShare extends LitElement {
  static styles = styles;

  @consume({ context: roomContext, subscribe: true })
  @state()
  room?: RoomState;

  override render() {
    const code = this.room?.name;
    if (!code) return nothing;

    const link = `${window.location.origin}/voice/${code}`;

    return html`
      <p class="subtitle">Share this <strong>code</strong> or <strong>link</strong> to invite others.</p>
      <div class="key-row">
        <ui-textfield class="textfield" disabled .value=${code}></ui-textfield>
        <ui-copy-button .value=${code}></ui-copy-button>
      </div>
      <div class="key-row">
        <ui-textfield class="textfield" disabled .value=${link}></ui-textfield>
        <ui-copy-button .value=${link}></ui-copy-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-room-share": RoomShare;
  }
}
