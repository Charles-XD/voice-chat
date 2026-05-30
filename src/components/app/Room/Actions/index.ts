import { consume } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { type CallApi, callContext } from "../../_context/call.context";

import styles from "./styles";

@customElement("app-room-actions")
export class RoomActions extends LitElement {
  static styles = styles;

  @consume({ context: callContext, subscribe: true })
  @state()
  call?: CallApi;

  private navigate(url: string) {
    this.dispatchEvent(new CustomEvent("navigate", { detail: url, bubbles: true, composed: true }));
  }

  private handleLeave = () => {
    this.call?.leave();
    this.navigate("/join");
  };

  private handleMute = (e: CustomEvent<{ muted: boolean }>) => {
    this.call?.setMuted(e.detail.muted);
  };

  override render() {
    return html`
      <div class="bar">
        <app-mute-button
          .muted=${this.call?.muted ?? true}
          @mute-change=${this.handleMute}
        ></app-mute-button>

        <ui-button color="error" @onClick=${this.handleLeave}>
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Leave</span>
        </ui-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-room-actions": RoomActions;
  }
}
