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
      min-height: 0;
    }

    .layout {
      display: flex;
      flex: 1;
      gap: 16px;
      min-height: 0;
    }

    .main {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-width: 0;
      min-height: 0;
    }

    .logs {
      flex: 0 0 30%;
      max-width: 30%;
      min-width: 320px;
      min-height: 0;
    }

    @media (max-width: 900px) {
      .layout {
        flex-direction: column;
      }

      .logs {
        flex: 0 0 auto;
        max-width: 100%;
        min-width: 0;
      }
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
