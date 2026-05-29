import { provide } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import styles from "./app.styles";
import { type RoomState, roomContext } from "./components/app/_context/room.context";

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

    this.addEventListener("room-change", this.handleRoomChange as EventListener);
  }

  disconnectedCallback() {
    this.removeEventListener("room-change", this.handleRoomChange as EventListener);

    super.disconnectedCallback();
  }

  private handleRoomChange = (e: CustomEvent<{ name: string }>) => {
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
