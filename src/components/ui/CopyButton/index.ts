import { css, CSSResultGroup, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("ui-copy-button")
export class CopyButton extends LitElement {
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

      width: 34px;
      height: 34px;
      padding: 0;
      border-radius: 999px;

      border: 1px solid var(--app-border, #334155);
      background: color-mix(in oklab, var(--app-surface, #1e293b) 70%, transparent);
      color: var(--app-text, #e5e7eb);

      cursor: pointer;
      transition:
        background-color 140ms ease,
        border-color 140ms ease,
        box-shadow 140ms ease,
        transform 80ms ease;
    }

    button:hover:not(:disabled) {
      background: var(--app-hover, rgba(148, 163, 184, 0.12));
    }

    button:active:not(:disabled) {
      transform: translateY(0.5px);
    }

    button:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px var(--app-focus, rgba(147, 197, 253, 0.35));
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.55;
    }

    svg {
      width: 18px;
      height: 18px;
      display: block;
    }
  `;

  @property({ type: String })
  value = "";

  @property({ type: Boolean })
  disabled = false;

  @state()
  private copied = false;

  private resetTimer?: number;

  disconnectedCallback(): void {
    if (this.resetTimer) window.clearTimeout(this.resetTimer);
    super.disconnectedCallback();
  }

  private async copy() {
    const text = this.value ?? "";
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for older browsers / non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }

    this.copied = true;
    if (this.resetTimer) window.clearTimeout(this.resetTimer);
    this.resetTimer = window.setTimeout(() => {
      this.copied = false;
    }, 900);
  }

  override render() {
    const isDisabled = this.disabled || !(this.value ?? "").trim();
    const label = this.copied ? "Copied" : "Copy to clipboard";

    return html`
      <button
        type="button"
        ?disabled=${isDisabled}
        @click=${this.copy}
        aria-label=${label}
        title=${label}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect
            x="9"
            y="9"
            width="13"
            height="13"
            rx="2"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-copy-button": CopyButton;
  }
}

