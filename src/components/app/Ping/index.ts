import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement('app-ping')
export class Ping extends LitElement {
  @property({ type: Number })
  latency = 0;

  override render() {
    return html`
      <span>(${this.latency} ms)</span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-ping": Ping;
  }
}