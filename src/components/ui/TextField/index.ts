import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import styles from "./styles";

@customElement('ui-textfield')
export class TextField extends LitElement {
  static styles = styles;

  @property({ type: Boolean }) disabled = false;
  @property({ type: String }) value = '';
  @property({ type: String }) label = '';
  @property({ type: String }) placeholder = '';
  @property({ type: String }) type = 'text';
  @property({ type: String }) error = '';
  @property({ type: Boolean }) required = false;

  protected onInput(e: Event) {
    const target = e.target as HTMLInputElement;
    this.value = target.value;

    this.dispatchEvent(
      new CustomEvent('onChange', {
        detail: this.value,
        bubbles: true,
        composed: true,
      })
    );
  }

  protected onKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Enter' || this.disabled) return;

    this.dispatchEvent(
      new CustomEvent('onEnter', {
        detail: this.value,
        bubbles: true,
        composed: true,
      })
    );

    // The native input lives in the shadow DOM, so it isn't associated with
    // the light-DOM form. Submit it manually to mimic native Enter behaviour.
    const form = this.closest('form');
    if (form) {
      e.preventDefault();
      form.requestSubmit();
    }
  }

  override render() {
    const invalid = Boolean(this.error);

    return html`
      ${this.label
        ? html`<label class="label" part="label">${this.label}</label>`
        : null}
      <input
        class=${invalid ? 'invalid' : ''}
        part="input"
        type=${this.type}
        placeholder=${this.placeholder}
        ?disabled=${this.disabled}
        ?required=${this.required}
        aria-invalid=${invalid ? 'true' : 'false'}
        .value=${this.value}
        @input=${this.onInput}
        @keydown=${this.onKeyDown}
      />
      ${invalid
        ? html`<span class="error" part="error" role="alert">${this.error}</span>`
        : null}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-textfield": TextField;
  }
}