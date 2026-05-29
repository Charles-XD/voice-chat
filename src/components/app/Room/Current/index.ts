import { consume } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

import { type RoomState, roomContext } from "../../_context/room.context";

@customElement("app-current-room")
export class CurrentRoom extends LitElement {
  static styles = css`
    :host {
      display: block;
    }

    .label {
      margin: 0 0 2px;
      font-size: 12px;
      color: var(--app-muted);
    }

    .title {
      margin: 0;
      font-size: 22px;
      line-height: 1.2;
      color: var(--app-text);
      word-break: break-word;
    }
  `;

  @consume({ context: roomContext, subscribe: true })
  @state()
  room?: RoomState;

  override render() {
    return html`
      <header>
        <h1 class="title">${this.room?.title || this.room?.name || "None"}</h1>
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-current-room": CurrentRoom;
  }
}
