import { ContextProvider, provide } from "@lit/context";
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { roomContext, RoomState } from "./components/app/_context/room.context";

import styles from "./app.styles";

@customElement("voice-app")
export class App extends LitElement {
  static styles = styles;

  @provide({ context: roomContext })
  @state()
  private room: RoomState = {
    name: "",
  };

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener(
      "room-change",
      this.handleRoomChange as EventListener,
    );
  }

  disconnectedCallback() {
    this.removeEventListener(
      "room-change",
      this.handleRoomChange as EventListener,
    );

    super.disconnectedCallback();
  }

  private handleRoomChange = (e: CustomEvent<{ name: string }>) => {
    // Replace object reference
    this.room = {
      ...this.room,
      name: e.detail.name,
    };
  };

  override render() {
    return html`
      <div class="layout">
        <div class="main">
          <app-mute-button></app-mute-button>
          <app-room-join></app-room-join>
          <app-current-room></app-current-room>
          <app-online-users-global></app-online-users-global>
        </div>

        <div class="logs">
          <app-logs></app-logs>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "voice-app": App;
  }
}
