import { ContextProvider, provide } from "@lit/context";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { roomContext, RoomState } from "./components/app/_context/room.context";

@customElement("voice-app")
export class App extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
  `;

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
      <app-mute-button></app-mute-button>
      <app-room-join></app-room-join>
      <app-current-room></app-current-room>
      <app-logs></app-logs>
      <app-online-users-global></app-online-users-global>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "voice-app": App;
  }
}
