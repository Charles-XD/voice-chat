import { CSSResultGroup, LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement('ui-button')
export class Button extends LitElement {
  static styles?: CSSResultGroup = css`
    :host {
      display: inline-block;
    }

    button {
      appearance: none;
      -webkit-tap-highlight-color: transparent;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: auto;

      padding: 8px 12px;
      border-radius: 999px;
      border: 1px solid transparent;

      font-size: 13px;
      font-weight: 500;
      line-height: 1;

      background: var(--ui-button-bg, #3b82f6);
      color: var(--ui-button-fg, #ffffff);

      cursor: pointer;
      transition:
        background-color 140ms ease,
        border-color 140ms ease,
        box-shadow 140ms ease,
        transform 80ms ease;
    }

    button:hover:not(:disabled) {
      background: var(--ui-button-bg-hover, #2563eb);
    }

    button:active:not(:disabled) {
      transform: translateY(0.5px);
    }

    button:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.35);
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    @media (prefers-reduced-motion: reduce) {
      button {
        transition: none;
      }
      button:active:not(:disabled) {
        transform: none;
      }
    }
  `;

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