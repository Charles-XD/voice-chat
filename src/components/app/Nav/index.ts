import { consume } from "@lit/context";
import { html, LitElement, type PropertyValues } from "lit";
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

  @state() private drawerOpen = false;
  @state() private isMobileView = false;

  private mobileQuery = window.matchMedia("(max-width: 900px)");
  private themeController = new ThemeController(this);
  private headerObserver?: ResizeObserver;

  private syncHeaderHeight(): void {
    document.documentElement.style.setProperty(
      "--app-header-height",
      `${Math.ceil(this.getBoundingClientRect().height)}px`,
    );
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.isMobileView = this.mobileQuery.matches;
    this.mobileQuery.addEventListener("change", this.handleMobileChange);
    document.addEventListener("keydown", this.handleDocumentKeydown);
  }

  override firstUpdated(): void {
    this.syncHeaderHeight();
    this.headerObserver = new ResizeObserver(() => this.syncHeaderHeight());
    this.headerObserver.observe(this);
  }

  override disconnectedCallback(): void {
    this.headerObserver?.disconnect();
    this.mobileQuery.removeEventListener("change", this.handleMobileChange);
    document.removeEventListener("keydown", this.handleDocumentKeydown);
    super.disconnectedCallback();
  }

  private handleMobileChange = (): void => {
    this.isMobileView = this.mobileQuery.matches;
    if (!this.mobileQuery.matches) this.drawerOpen = false;
  };

  private handleDocumentKeydown = (e: KeyboardEvent): void => {
    if (e.key === "Escape" && this.drawerOpen) this.closeDrawer();
  };

  private isActive(href: string): boolean {
    const path = this.path || "/";
    if (href === "/") return path === "/";
    return path === href || path.startsWith(`${href}/`);
  }

  private openDrawer(): void {
    this.drawerOpen = true;
    this.toggleAttribute("data-drawer-open", true);
  }

  private closeDrawer(): void {
    this.drawerOpen = false;
    this.toggleAttribute("data-drawer-open", false);
  }

  private toggleTheme(): void {
    this.themeController.toggle(this.theme);
  }

  private emitLogout(): void {
    this.closeDrawer();
    this.dispatchEvent(new CustomEvent("logout", { bubbles: true, composed: true }));
  }

  private handleDrawerLinkClick(): void {
    this.closeDrawer();
  }

  private renderThemeIcon(): unknown {
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

  private renderMenuIcon(): unknown {
    return html`<svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="7" x2="20" y2="7"></line>
      <line x1="4" y1="12" x2="20" y2="12"></line>
      <line x1="4" y1="17" x2="20" y2="17"></line>
    </svg>`;
  }

  private renderCloseIcon(): unknown {
    return html`<svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>`;
  }

  private renderSettingsIcon(): unknown {
    return html`<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>`;
  }

  private renderNavLinks(inDrawer = false): unknown {
    const linkClass = (href: string) =>
      `${inDrawer ? "drawer-link" : ""} ${this.isActive(href) ? "active" : ""}`.trim();

    return html`
      <a href="/" class=${linkClass("/")} @click=${this.handleDrawerLinkClick}>Home</a>
      ${
        isAuthenticated(this.user)
          ? html`<a href="/join" class=${linkClass("/join")} @click=${this.handleDrawerLinkClick}
              >Join</a
            >`
          : ""
      }
      ${
        canUseKeyFeatures(this.user)
          ? html`<a
              href="/profile"
              class=${linkClass("/profile")}
              @click=${this.handleDrawerLinkClick}
              >Profile</a
            >`
          : ""
      }
    `;
  }

  private renderSettingsLink(inDrawer = false): unknown {
    if (!isAuthenticated(this.user)) return "";

    if (inDrawer) {
      return html`<a
        href="/settings"
        class="drawer-link drawer-settings ${this.isActive("/settings") ? "active" : ""}"
        @click=${this.handleDrawerLinkClick}
      >
        ${this.renderSettingsIcon()}
        <span>Settings</span>
      </a>`;
    }

    return html`<a
      class="icon-button ${this.isActive("/settings") ? "active" : ""}"
      href="/settings"
      aria-label="Settings"
      title="Settings"
    >
      ${this.renderSettingsIcon()}
    </a>`;
  }

  private renderThemeControl(inDrawer = false): unknown {
    const themeLabel = this.theme === "dark" ? "Switch to light theme" : "Switch to dark theme";

    if (inDrawer) {
      return html`<button
        class="drawer-link drawer-theme"
        type="button"
        @click=${this.toggleTheme}
        aria-label=${themeLabel}
      >
        ${this.renderThemeIcon()}
        <span>${this.theme === "dark" ? "Light theme" : "Dark theme"}</span>
      </button>`;
    }

    return html`<button
      class="icon-button"
      type="button"
      @click=${this.toggleTheme}
      aria-label=${themeLabel}
      title=${themeLabel}
    >
      ${this.renderThemeIcon()}
    </button>`;
  }

  override updated(changed: PropertyValues<this>): void {
    if (changed.has("path") && this.drawerOpen) this.closeDrawer();
  }

  override render() {
    return html`
      <nav class=${this.drawerOpen ? "drawer-open" : ""}>
        <button
          class="menu-toggle"
          type="button"
          @click=${this.openDrawer}
          aria-expanded=${this.drawerOpen}
          aria-label="Open navigation menu"
        >
          ${this.renderMenuIcon()}
        </button>

        <div class="nav-left">
          <div class="nav-links">${this.renderNavLinks()}</div>
        </div>

        <div class="nav-right">
          ${this.renderSettingsLink()}
          ${this.renderThemeControl()}

          ${
            isAuthenticated(this.user)
              ? html`<div class="user-info">
                <app-connection-status></app-connection-status>
                <ui-button @onClick=${this.emitLogout}>Logout</ui-button>
              </div>`
              : ""
          }
        </div>

        ${
          isAuthenticated(this.user)
            ? html`<div class="nav-mobile-actions">
              <ui-button @onClick=${this.emitLogout}>Logout</ui-button>
            </div>`
            : html`<div class="nav-mobile-actions"></div>`
        }
      </nav>

      <button
        class="drawer-backdrop"
        type="button"
        aria-label="Close navigation menu"
        @click=${this.closeDrawer}
      ></button>

      <aside class="nav-drawer" aria-hidden=${this.isMobileView && !this.drawerOpen ? "true" : "false"}>
        <div class="drawer-header">
          <h2 class="drawer-title">Menu</h2>
          <button
            class="drawer-close"
            type="button"
            aria-label="Close navigation menu"
            @click=${this.closeDrawer}
          >
            ${this.renderCloseIcon()}
          </button>
        </div>

        <div class="drawer-links">${this.renderNavLinks(true)}</div>

        <div class="drawer-footer">
          ${
            isAuthenticated(this.user)
              ? html`<div class="drawer-status">
                <app-connection-status></app-connection-status>
              </div>`
              : ""
          }
          ${this.renderSettingsLink(true)} ${this.renderThemeControl(true)}
        </div>
      </aside>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-nav": AppNav;
  }
}
