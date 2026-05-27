import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement('ui-textfield')
export class TextField extends LitElement {
  static styles?: CSSResultGroup = css`
    :host {
      display: block;
      box-sizing: border-box;
    }

    input {
      width: 100%;
      box-sizing: border-box;

      padding: 8px 10px;
      margin: 0;
      border-radius: 6px;
      border: 1px solid var(--app-border, #334155);

      background: var(--app-surface, #1e293b);
      color: var(--app-text, #e5e7eb);

      line-height: 1.5rem;
      font: inherit;

      outline: none;
    }

    input::placeholder {
      color: var(--app-muted, #94a3b8);
      opacity: 0.9;
    }

    input:focus-visible {
      border-color: var(--app-link, #93c5fd);
      box-shadow: 0 0 0 3px var(--app-focus, rgba(147, 197, 253, 0.35));
    }

    input:disabled {
      cursor: not-allowed;
      opacity: 0.65;
      background: color-mix(in oklab, var(--app-surface, #1e293b) 80%, var(--app-bg, #0f172a));
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