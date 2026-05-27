import { CSSResultGroup, LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { Router } from "@lit-labs/router";

import "./pages/403/403.page";
import "./pages/404/404.page";
import "./pages/home/home.page";
import "./pages/profile/profile.page";
import "./pages/room/room.page";
import "./app";

import { consume } from "@lit/context";
import { userContext } from "./providers/user.provider";
import { User } from "./interfaces/user.interface";
import { authGuard } from "./guards/auth.guard";
import { UserController } from "./controllers/user.controller";
import { logger } from "./components/app/_services/logger.service";
import { state } from "lit/decorators.js";

@customElement("app-router")
class AppRouter extends LitElement {
  static styles?: CSSResultGroup = css`
    :host {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      min-height: 100%;

      /* Dark theme tokens (aligned with app-logs) */
      color-scheme: dark;
      --app-bg: #0f172a;
      --app-surface: #1e293b;
      --app-surface-2: #0b1220;
      --app-border: #334155;
      --app-text: #e5e7eb;
      --app-muted: #94a3b8;
      --app-link: #93c5fd;
      --app-focus: rgba(147, 197, 253, 0.35);
      --app-hover: rgba(148, 163, 184, 0.12);

      /* Shared component tokens */
      --ui-button-bg: #3b82f6;
      --ui-button-bg-hover: #2563eb;
      --ui-button-fg: #ffffff;
      --signal-off: #64748b;

      /* Connection status (dark theme defaults) */
      --status-connected-fg: #86efac;
      --status-connected-bg: rgba(34, 197, 94, 0.14);
      --status-connected-border: rgba(34, 197, 94, 0.35);
      --status-connected-dot: #22c55e;
      --status-connected-ring: rgba(34, 197, 94, 0.15);

      --status-connecting-fg: #fde68a;
      --status-connecting-bg: rgba(245, 158, 11, 0.14);
      --status-connecting-border: rgba(245, 158, 11, 0.35);
      --status-connecting-dot: #f59e0b;
      --status-connecting-ring: rgba(245, 158, 11, 0.15);

      --status-disconnected-fg: #fecaca;
      --status-disconnected-bg: rgba(239, 68, 68, 0.14);
      --status-disconnected-border: rgba(239, 68, 68, 0.35);
      --status-disconnected-dot: #ef4444;
      --status-disconnected-ring: rgba(239, 68, 68, 0.15);
    }

    :host([data-theme="light"]) {
      color-scheme: light;
      --app-bg: #f8fafc;
      --app-surface: #ffffff;
      --app-surface-2: #ffffff;
      --app-border: #e5e7eb;
      --app-text: #0f172a;
      --app-muted: #64748b;
      --app-link: #2563eb;
      --app-focus: rgba(59, 130, 246, 0.25);
      --app-hover: rgba(15, 23, 42, 0.06);

      --signal-off: #cbd5e1;

      /* Connection status (light theme overrides for contrast) */
      --status-connected-fg: #166534;
      --status-connected-bg: #dcfce7;
      --status-connected-border: #86efac;
      --status-connected-dot: #16a34a;
      --status-connected-ring: rgba(22, 163, 74, 0.2);

      --status-connecting-fg: #92400e;
      --status-connecting-bg: #ffedd5;
      --status-connecting-border: #fdba74;
      --status-connecting-dot: #f59e0b;
      --status-connecting-ring: rgba(245, 158, 11, 0.18);

      --status-disconnected-fg: #7f1d1d;
      --status-disconnected-bg: #fee2e2;
      --status-disconnected-border: #fca5a5;
      --status-disconnected-dot: #ef4444;
      --status-disconnected-ring: rgba(239, 68, 68, 0.18);
    }

    nav {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 12px 16px;
      background: var(--app-surface-2);
      border-bottom: 1px solid var(--app-border);
    }

    .nav-left {
      display: inline-flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      min-width: 0;
    }

    .nav-links {
      display: inline-flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
    }

    a {
      color: var(--app-text);
      text-decoration: none;
      font-weight: 500;
      font-size: 15px;
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid transparent;
    }

    a:hover {
      background: var(--app-hover);
    }

    a:focus-visible {
      outline: none;
      border-color: var(--app-link);
      box-shadow: 0 0 0 3px var(--app-focus);
    }

    .nav-right {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    main {
      display: flex;
      flex-grow: 1;
      justify-content: center;
      padding: 24px;
      background: var(--app-bg);
      color: var(--app-text);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .theme-toggle {
      appearance: none;
      -webkit-tap-highlight-color: transparent;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      width: 34px;
      height: 34px;
      padding: 0;
      justify-content: center;
      border-radius: 999px;
      border: 1px solid var(--app-border);
      background: color-mix(in oklab, var(--app-surface) 70%, transparent);
      color: var(--app-text);
      font: inherit;
      font-size: 13px;
      line-height: 1;
      cursor: pointer;
      user-select: none;
    }

    .theme-toggle:hover {
      background: var(--app-hover);
    }

    .theme-toggle:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px var(--app-focus);
    }

    .theme-toggle svg {
      width: 18px;
      height: 18px;
      display: block;
    }

    @media (max-width: 520px) {
      nav {
        align-items: flex-start;
      }
      .user-info {
        width: 100%;
        justify-content: space-between;
      }
    }
  `;

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
      path: "/room/:id",
      render: ({ id }) => html`<room-page roomId=${id}></room-page>`,
      enter: (): boolean => authGuard(this.router, this.user),
    },
    {
      path: "/profile",
      render: () => html`<profile-page></profile-page>`,
      enter: (): boolean => authGuard(this.router, this.user),
    },
    {
      path: "/voice",
      render: () => html`<voice-app></voice-app>`,
      enter: (): boolean => authGuard(this.router, this.user),
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
            ${this.user?.key
              ? html`<a href="/profile">Profile</a> <a href="/room/join">Join</a>`
              : ""}
          </div>
        </div>
        <div class="nav-right">
          <button
            class="theme-toggle"
            type="button"
            @click=${this.toggleTheme}
            aria-label=${this.theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            title=${this.theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            ${this.theme === "dark"
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
                </svg>`}
          </button>

          ${this.user?.key
            ? html`<div class="user-info">
                <app-connection-status></app-connection-status>
                <ui-button @onClick=${this.handleLogout}>Logout</ui-button>
              </div>`
            : ""}
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
