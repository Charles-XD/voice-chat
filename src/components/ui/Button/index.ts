import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement('ui-button')
export class Button extends LitElement {
  @property({ type: Boolean }) disabled = false;
  @property({ type: String, attribute: true }) type = "button";

  protected handleClick(e: Event) {
    this.dispatchEvent(
      new CustomEvent('onClick', {
        detail: { originalEvent: e },
        bubbles: true,
        composed: true,
      })
    );

    if (this.type === 'submit' && !this.disabled) {
      const form = this.closest('form');
      if (form) {
        // requestSubmit() respects HTML5 form validation and fires the onSubmit event
        form.requestSubmit(); 
      }
    }
  }

  protected renderContent() {
    return html`<slot></slot>`;
  }

  override render() {
    return html`
      <button
        part="button"
        type=${this.type}
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