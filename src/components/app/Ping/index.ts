import { CSSResultGroup, LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement('app-ping')
export class Ping extends LitElement {
  static styles?: CSSResultGroup = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .signal {
      display: inline-flex;
      align-items: flex-end;
      gap: 2px;
      height: 14px;
    }

    .bar {
      width: 3px;
      border-radius: 2px;
      background: var(--signal-off, #cbd5e1);
      opacity: 0.35;
    }

    .bar:nth-child(1) {
      height: 4px;
    }
    .bar:nth-child(2) {
      height: 7px;
    }
    .bar:nth-child(3) {
      height: 10px;
    }
    .bar:nth-child(4) {
      height: 13px;
    }

    .signal[data-bars="0"] .bar {
      background: var(--signal-disconnected, #ef4444);
      opacity: 0.6;
    }

    .signal[data-bars="1"] .bar:nth-child(-n + 1),
    .signal[data-bars="2"] .bar:nth-child(-n + 2),
    .signal[data-bars="3"] .bar:nth-child(-n + 3),
    .signal[data-bars="4"] .bar:nth-child(-n + 4) {
      opacity: 1;
    }

    .signal[data-quality="bad"] .bar {
      background: var(--signal-bad, #ef4444);
    }
    .signal[data-quality="poor"] .bar {
      background: var(--signal-poor, #f97316);
    }
    .signal[data-quality="ok"] .bar {
      background: var(--signal-ok, #f59e0b);
    }
    .signal[data-quality="good"] .bar {
      background: var(--signal-good, #22c55e);
    }

    .ms {
      color: var(--app-muted, #94a3b8);
      font-size: 12px;
    }
  `;

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
    const label = this.connected
      ? `Connection ${quality} (${this.latency} ms)`
      : "Disconnected";

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