import { ContextProvider, provide } from "@lit/context";
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { roomContext, RoomState } from "./components/app/_context/room.context";

@customElement("voice-app")
export class App extends LitElement {
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
      <app-connection-status></app-connection-status>

      <ui-button disabled> disabled </ui-button>

      <app-mute-button></app-mute-button>
      <br />
      <app-room-join></app-room-join>
      <br />
      <app-current-room></app-current-room>
      <br />
      <app-logs></app-logs>
      <br />
      <app-online-users-global></app-online-users-global>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "voice-app": App;
  }
}
