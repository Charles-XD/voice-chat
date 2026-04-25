import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement('ui-textfield')
export class TextField extends LitElement {

  override render() {
    return html`<input></input>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-textfield": TextField;
  }
}