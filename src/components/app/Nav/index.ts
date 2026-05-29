import { consume } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { ThemeController } from "../../../controllers/theme.controller";
import { canUseKeyFeatures, isAuthenticated } from "../../../guards/access";
import type { Theme } from "../../../interfaces/theme.interface";
import type { User } from "../../../interfaces/user.interface";
import { themeContext } from "../../../providers/theme.provider";
import { userContext } from "../../../providers/user.provider";

import styles from "./styles";

@customElement("app-nav")
export class AppNav extends LitElement {
  static styles = styles;

  @consume({ context: userContext, subscribe: true })
  user?: User | null;

  /** Active route, used to highlight the current nav item. */
  @property() path = "/";

  @consume({ context: themeContext, subscribe: true })
  @state()
  theme: Theme = "dark";

  private themeController = new ThemeController(this);

  private isActive(href: string): boolean {
    const path = this.path || "/";
    if (href === "/") return path === "/";
    return path === href || path.startsWith(`${href}/`);
  }

  private toggleTheme() {
    this.themeController.toggle(this.theme);
  }

  private emitLogout() {
    this.dispatchEvent(new CustomEvent("logout", { bubbles: true, composed: true }));
  }

  private renderThemeIcon() {
    return this.theme === "dark"
      ? html`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>`
      : html`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="2" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>`;
  }

  override render() {
    const themeLabel = this.theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

    return html`
      <nav>
        <div class="nav-left">
          <div class="nav-links">
            <a href="/" class=${this.isActive("/") ? "active" : ""}>Home</a>
            ${
              isAuthenticated(this.user)
                ? html`<a href="/join" class=${this.isActive("/join") ? "active" : ""}>Join</a>`
                : ""
            }
            ${
              canUseKeyFeatures(this.user)
                ? html`<a href="/profile" class=${this.isActive("/profile") ? "active" : ""}>Profile</a>`
                : ""
            }
          </div>
        </div>

        <div class="nav-right">
          ${
            isAuthenticated(this.user)
              ? html`<a
                class="icon-button ${this.isActive("/settings") ? "active" : ""}"
                href="/settings"
                aria-label="Settings"
                title="Settings"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                  <path
                    d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </a>`
              : ""
          }

          <button
            class="icon-button"
            type="button"
            @click=${this.toggleTheme}
            aria-label=${themeLabel}
            title=${themeLabel}
          >
            ${this.renderThemeIcon()}
          </button>

          ${
            isAuthenticated(this.user)
              ? html`<div class="user-info">
                <app-connection-status></app-connection-status>
                <ui-button @onClick=${this.emitLogout}>Logout</ui-button>
              </div>`
              : ""
          }
        </div>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-nav": AppNav;
  }
}
