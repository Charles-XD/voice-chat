import { html, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Button } from "../../ui/Button";
import { logger } from "../_services/logger.service";

@customElement("app-mute-button")
export class MuteButton extends Button {
  @property({ type: Boolean }) muted = true;

  protected override willUpdate(changed: PropertyValues<this>) {
    // Muted is destructive (silenced) → error; live mic → neutral secondary.
    if (changed.has("muted")) {
      this.color = this.muted ? "error" : "secondary";
    }
  }

  protected override handleClick(_e: Event) {
    this.muted = !this.muted;
    logger.log("INFO", `${this.muted ? "Mute" : "Unmute"}`);

    this.dispatchEvent(
      new CustomEvent("mute-change", {
        detail: { muted: this.muted },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private renderIcon() {
    if (this.muted) {
      return html`<svg
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
        <line x1="2" y1="2" x2="22" y2="22"></line>
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6"></path>
        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
      </svg>`;
    }

    return html`<svg
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
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="23"></line>
      <line x1="8" y1="23" x2="16" y2="23"></line>
    </svg>`;
  }

  protected override renderContent() {
    return html`${this.renderIcon()}<span>${this.muted ? "Unmute" : "Mute"}</span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-mute-button": MuteButton;
  }
}
