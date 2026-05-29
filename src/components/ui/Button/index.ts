import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import styles from "./styles";

@customElement("ui-button")
export class Button extends LitElement {
  static styles = styles;

  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) loading = false;
  @property({ type: String, attribute: true }) type = "button";
  @property({ type: String }) color: "primary" | "secondary" | "error" = "primary";

  protected handleClick(e: Event) {
    if (this.disabled || this.loading) return;

    this.dispatchEvent(
      new CustomEvent("onClick", {
        detail: { originalEvent: e },
        bubbles: true,
        composed: true,
      }),
    );

    if (this.type === "submit") {
      const form = this.closest("form");
      if (form) {
        // requestSubmit() respects HTML5 form validation and fires the onSubmit event
        form.requestSubmit();
      }
    }
  }

  protected renderContent() {
    return html`<slot></slot>`;
  }

  private renderComet() {
    const dots = 12;
    return html`<span class="comet" aria-hidden="true">
      ${Array.from(
        { length: dots },
        (_, i) => html`<span class="comet-dot" style="--i:${i}"></span>`,
      )}
    </span>`;
  }

  override render() {
    return html`
      <button
        class="${this.color}${this.loading ? " loading" : ""}"
        part="button"
        type=${this.type}
        ?disabled=${this.disabled || this.loading}
        aria-busy=${this.loading ? "true" : "false"}
        @click=${this.handleClick}
      >
        ${this.loading ? this.renderComet() : null}
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
