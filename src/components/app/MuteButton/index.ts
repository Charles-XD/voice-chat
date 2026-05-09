import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Button } from "../../ui/Button";
import { logger } from "../_services/logger.service";

@customElement('app-mute-button')
export class MuteButton extends Button {
  @property({ type: Boolean }) muted = false;

  @property({ attribute: false })
  onClick?: (e: Event) => void;

  protected override handleClick(e: Event) {
    this.muted = !this.muted;
    logger.log('INFO', `${this.muted ? 'Mute' : 'Unmute'}`);
    this.onClick?.(e);
  }

  protected override renderContent() {
    return this.muted
      ? html`<slot name="unmute">Unmute</slot>`
      : html`<slot name="mute">Mute</slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-mute-button": MuteButton;
  }
}