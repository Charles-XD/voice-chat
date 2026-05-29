import { Router } from "@lit-labs/router";
import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import styles from "./app.router.styles";
import { tokens } from "./styles/tokens.styles";

import "./pages/403/403.page";
import "./pages/404/404.page";
import "./pages/home/home.page";
import "./pages/join/join.page";
import "./pages/profile/profile.page";
import "./pages/room/room.page";
import "./pages/settings/settings.page";
import "./app";

import { consume } from "@lit/context";
import { state } from "lit/decorators.js";
import { logger } from "./components/app/_services/logger.service";
import { UserController } from "./controllers/user.controller";
import { canUseKeyFeatures, isAuthenticated } from "./guards/access";
import { authGuard, keyGuard } from "./guards/auth.guard";
import type { User } from "./interfaces/user.interface";
import { userContext } from "./providers/user.provider";

@customElement("app-router")
class AppRouter extends LitElement {
  static styles = [tokens, styles];

  @consume({ context: userContext, subscribe: true })
  user?: User | null;

  private userController = new UserController(this);

  @state()
  private theme: "dark" | "light" = "dark";

  private router = new Router(this, [
    {
      path: "/",
      render: () => html`<home-page @navigate=${this.onNavigate}></home-page>`,
    },
    {
      path: "/join{/:id}?",
      render: ({ id }) =>
        html`<join-page roomId=${id ?? ""} @navigate=${this.onNavigate}></join-page>`,
      enter: (): boolean => authGuard(this.router, this.user),
    },
    {
      path: "/room/:id",
      render: ({ id }) => html`<room-page roomId=${id}></room-page>`,
      enter: (): boolean => authGuard(this.router, this.user),
    },
    {
      path: "/profile",
      render: () => html`<profile-page></profile-page>`,
      enter: (): boolean => keyGuard(this.router, this.user),
    },
    {
      path: "/settings",
      render: () => html`<settings-page></settings-page>`,
      enter: (): boolean => authGuard(this.router, this.user),
    },
    {
      path: "/voice",
      render: () => html`<voice-app></voice-app>`,
      enter: (): boolean => keyGuard(this.router, this.user),
    },
    {
      path: "/403",
      render: () => html`<not-authorized-page></not-authorized-page>`,
    },
    { path: "/*", render: () => html`<not-found-page></not-found-page>` },
  ]);

  private onNavigate(e: CustomEvent<string>) {
    this.router.goto(e.detail);
    history.replaceState({}, "", e.detail);
  }

  override connectedCallback(): void {
    super.connectedCallback();

    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      this.theme = saved;
    }
    this.setAttribute("data-theme", this.theme);
  }

  protected override updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (!changed.has("theme")) return;

    this.setAttribute("data-theme", this.theme);
    localStorage.setItem("theme", this.theme);
  }

  private toggleTheme = () => {
    this.theme = this.theme === "dark" ? "light" : "dark";
  };

  private handleLogout() {
    logger.clear();
    this.userController.logout();
    this.router.goto("/");
    history.replaceState({}, "", "/");
  }

  render() {
    return html`
      <nav>
        <div class="nav-left">
          <div class="nav-links">
            <a href="/">Home</a>
            ${isAuthenticated(this.user) ? html`<a href="/join">Join</a>` : ""}
            ${canUseKeyFeatures(this.user) ? html`<a href="/profile">Profile</a>` : ""}
          </div>
        </div>
        <div class="nav-right">
          ${
            isAuthenticated(this.user)
              ? html`<a class="icon-button" href="/settings" aria-label="Settings" title="Settings">
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
            aria-label=${this.theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title=${this.theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            ${
              this.theme === "dark"
                ? html`<svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>`
                : html`<svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    stroke="currentColor"
                    stroke-width="2"
                  />
                  <path
                    d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>`
            }
          </button>

          ${
            isAuthenticated(this.user)
              ? html`<div class="user-info">
                <app-connection-status></app-connection-status>
                <ui-button @onClick=${this.handleLogout}>Logout</ui-button>
              </div>`
              : ""
          }
        </div>
      </nav>

      <main>${this.router.outlet()}</main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-router": AppRouter;
  }
}
