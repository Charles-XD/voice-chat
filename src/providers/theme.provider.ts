import { createContext, provide } from "@lit/context";
import { css, html, LitElement, type PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { Theme } from "../interfaces/theme.interface";
import { tokens } from "../styles/tokens.styles";

export const themeContext = createContext<Theme>(Symbol("theme-context"));
export const THEME_CHANGE_EVENT = "theme-change-event";
export const THEME_KEY = "theme";

@customElement("theme-provider")
export class ThemeProvider extends LitElement {
  static styles = [
    tokens,
    css`
      :host {
        display: contents;
      }
    `,
  ];

  @provide({ context: themeContext })
  @state()
  theme: Theme = "dark";

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(THEME_CHANGE_EVENT, this.handleThemeChange as EventListener);

    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") {
      this.theme = saved;
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(THEME_CHANGE_EVENT, this.handleThemeChange as EventListener);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("theme")) {
      this.setAttribute("data-theme", this.theme);
    }
  }

  private handleThemeChange = (e: CustomEvent<Theme>) => {
    this.theme = e.detail;
    try {
      localStorage.setItem(THEME_KEY, this.theme);
    } catch (error) {
      console.error("Failed to persist theme:", error);
    }
  };

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "theme-provider": ThemeProvider;
  }
}
