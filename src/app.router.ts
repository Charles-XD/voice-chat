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

@customElement("app-router")
class AppRouter extends LitElement {
  static styles?: CSSResultGroup = css`
    :host {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }

    nav {
      padding: 24px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
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
    this.userController.logout();
    this.router.goto("/");
    history.replaceState({}, "", "/");
  }

  render() {
    return html`
      <nav>
        <div>
          <a href="/">Home</a>
          ${this.user?.key
            ? html` <a href="/profile">Profile</a>
                <a href="/room/join">Join</a>`
            : ""}
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
