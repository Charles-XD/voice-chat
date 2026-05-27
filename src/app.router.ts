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

@customElement("app-router")
class AppRouter extends LitElement {
  static styles?: CSSResultGroup = css`
    :host {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      min-height: 100%;
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
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
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
      color: #0f172a;
      text-decoration: none;
      font-weight: 500;
      font-size: 15px;
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid transparent;
    }

    a:hover {
      background: #f1f5f9;
    }

    a:focus-visible {
      outline: none;
      border-color: #93c5fd;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25);
    }

    main {
      display: flex;
      flex-grow: 1;
      justify-content: center;
      padding: 24px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
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
        ${this.user?.key
          ? html`<div class="user-info">
              <app-connection-status></app-connection-status>
              <ui-button @onClick=${this.handleLogout}>Logout</ui-button>
            </div>`
          : ""}
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
