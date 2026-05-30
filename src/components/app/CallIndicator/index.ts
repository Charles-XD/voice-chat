import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { type ActiveCall, callService } from "../_services/call.service";

import styles from "./styles";

@customElement("app-call-indicator")
export class CallIndicator extends LitElement {
  static styles = styles;

  /** Current route path, provided by the router. */
  @property() path = "";

  @state() private call: ActiveCall | null = null;

  private unsubscribe?: () => void;

  override connectedCallback(): void {
    super.connectedCallback();
    this.unsubscribe = callService.subscribe((call) => {
      this.call = call;
    });
  }

  override disconnectedCallback(): void {
    this.unsubscribe?.();
    super.disconnectedCallback();
  }

  private get inCallRoute(): boolean {
    return this.path.startsWith("/voice/");
  }

  private get open(): boolean {
    // Show only when there's an active call and we're not already on its page.
    return Boolean(this.call) && !this.inCallRoute;
  }

  private returnToCall() {
    if (!this.call) return;
    this.dispatchEvent(
      new CustomEvent("navigate", {
        detail: `/voice/${encodeURIComponent(this.call.roomId)}`,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private renderMic(muted: boolean) {
    return muted
      ? html`<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="2" y1="2" x2="22" y2="22"></line>
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6"></path>
          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
        </svg>`
      : html`<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>`;
  }

  private renderCamera(on: boolean) {
    return on
      ? html`<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M23 7l-7 5 7 5V7z"></path>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </svg>`
      : html`<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="2" y1="2" x2="22" y2="22"></line>
          <path d="M16 16H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2m4 0h2a2 2 0 0 1 2 2v5m0 4l4 3V7l-4 3"></path>
        </svg>`;
  }

  override render() {
    const call = this.call;

    return html`
      <div class="drawer ${this.open ? "open" : ""}" role="button" tabindex="0"
        @click=${this.returnToCall}
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") this.returnToCall();
        }}>
        <span class="pulse" aria-hidden="true"></span>
        <div class="info">
          <span class="label">In call</span>
          <span class="title">${call?.title ?? ""}</span>
        </div>
        <div class="status">
          <span class="badge ${call?.muted ? "off" : "on"}">${this.renderMic(Boolean(call?.muted))}</span>
          <span class="badge ${call?.cameraOn ? "on" : "off"}">${this.renderCamera(Boolean(call?.cameraOn))}</span>
        </div>
        <span class="cta">Return</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-call-indicator": CallIndicator;
  }
}
