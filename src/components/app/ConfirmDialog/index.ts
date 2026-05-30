import { consume } from "@lit/context";
import { html, LitElement, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { Theme } from "../../../interfaces/theme.interface";
import { themeContext, THEME_CHANGE_EVENT, THEME_KEY } from "../../../providers/theme.provider";
import { tokens } from "../../../styles/tokens.styles";

import styles from "./styles";

export type ConfirmDialogOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: "primary" | "secondary" | "error";
};

@customElement("app-confirm-dialog")
export class ConfirmDialog extends LitElement {
  static styles = [tokens, styles];

  @property({ type: Boolean, reflect: true }) open = false;

  @consume({ context: themeContext, subscribe: true })
  @state()
  private theme: Theme = "dark";

  @state() private title = "";
  @state() private message = "";
  @state() private confirmLabel = "Confirm";
  @state() private cancelLabel = "Cancel";
  @state() private confirmColor: "primary" | "secondary" | "error" = "error";

  private resolver?: (confirmed: boolean) => void;

  private handleThemeChange = (e: CustomEvent<Theme>) => {
    this.theme = e.detail;
  };

  private readThemeFromProvider(): Theme {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
    const provider = document.querySelector("theme-provider");
    const attr = provider?.getAttribute("data-theme");
    return attr === "light" ? "light" : "dark";
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.theme = this.readThemeFromProvider();
    this.setAttribute("data-theme", this.theme);
    document.addEventListener(THEME_CHANGE_EVENT, this.handleThemeChange as EventListener);
    document.addEventListener("keydown", this.handleKeydown);
  }

  override disconnectedCallback(): void {
    document.removeEventListener(THEME_CHANGE_EVENT, this.handleThemeChange as EventListener);
    document.removeEventListener("keydown", this.handleKeydown);
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("theme")) {
      this.setAttribute("data-theme", this.theme);
    }
  }

  async ask(options: ConfirmDialogOptions): Promise<boolean> {
    if (this.resolver) {
      this.resolver(false);
      this.resolver = undefined;
    }

    this.setAttribute("data-theme", this.theme);
    this.title = options.title;
    this.message = options.message;
    this.confirmLabel = options.confirmLabel ?? "Confirm";
    this.cancelLabel = options.cancelLabel ?? "Cancel";
    this.confirmColor = options.confirmColor ?? "error";
    this.open = true;
    await this.updateComplete;

    return new Promise((resolve) => {
      this.resolver = resolve;
    });
  }

  private finish(confirmed: boolean): void {
    this.open = false;
    this.resolver?.(confirmed);
    this.resolver = undefined;
  }

  private handleConfirm = (): void => {
    this.finish(true);
  };

  private handleCancel = (): void => {
    this.finish(false);
  };

  private handleBackdrop = (): void => {
    this.finish(false);
  };

  private handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === "Escape" && this.open) this.finish(false);
  };

  override render() {
    if (!this.open) return html``;

    return html`
      <button class="backdrop" type="button" aria-label="Cancel" @click=${this.handleBackdrop}></button>
      <div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title" class="title">${this.title}</h2>
        <p class="message">${this.message}</p>
        <div class="actions">
          <ui-button color="secondary" @onClick=${this.handleCancel}>${this.cancelLabel}</ui-button>
          <ui-button color=${this.confirmColor} @onClick=${this.handleConfirm}>${this.confirmLabel}</ui-button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-confirm-dialog": AppConfirmDialog;
  }
}
