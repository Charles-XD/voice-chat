import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement('ui-button')
export class Button extends LitElement {
  @property({ type: Boolean }) disabled = false;

  protected handleClick(_e: Event) {}

  protected renderContent() {
    return html`<slot></slot>`
  }

  override render() {
    return html`
      <button
        part="button"
        ?disabled=${this.disabled} 
        @click=${this.handleClick}
      >
        ${this.renderContent()}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-button": Button;
  }
}