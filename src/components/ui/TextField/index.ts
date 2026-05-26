import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement('ui-textfield')
export class TextField extends LitElement {
  static styles?: CSSResultGroup = css`
    :host {
      display: block;
      padding: 8px;
      box-sizing: border-box;
    }

    input {
      outline: none;
      width: 100%;
      padding: 0;
      margin: 0;
      border: none;
      line-height: 1.5rem;
      font-family: Consolas, monaco, monospace;
    }
  `;

  @property({ type: Boolean }) disabled = false;
  @property({ type: String }) value = '';

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

  override render() {
    return html`
      <input 
        ?disabled=${this.disabled}
        .value=${this.value}
        @input=${this.onInput}
      />
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-textfield": TextField;
  }
}