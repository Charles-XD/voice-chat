import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import styles from "./styles";

@customElement("app-ping")
export class Ping extends LitElement {
  static styles = styles;

  @property({ type: Boolean })
  connected = true;

  @property({ type: Number })
  latency = 0;

  private getQuality(): "good" | "ok" | "poor" | "bad" {
    if (this.latency <= 80) return "good";
    if (this.latency <= 160) return "ok";
    if (this.latency <= 300) return "poor";
    return "bad";
  }

  private getBars(): number {
    if (!this.connected) return 0;
    const q = this.getQuality();
    if (q === "good") return 4;
    if (q === "ok") return 3;
    if (q === "poor") return 2;
    return 1;
  }

  override render() {
    const quality = this.connected ? this.getQuality() : "bad";
    const bars = this.getBars();
    const label = this.connected ? `Connection ${quality} (${this.latency} ms)` : "Disconnected";

    return html`
      <span
        class="signal"
        data-quality=${quality}
        data-bars=${String(bars)}
        role="img"
        aria-label=${label}
        title=${label}
      >
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </span>
      ${this.connected ? html`<span class="ms">${this.latency} ms</span>` : ""}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-ping": Ping;
  }
}
