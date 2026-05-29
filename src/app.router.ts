import { Router } from "@lit-labs/router";
import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import styles from "./app.router.styles";

import "./pages/403/403.page";
import "./pages/404/404.page";
import "./pages/home/home.page";
import "./pages/join/join.page";
import "./pages/profile/profile.page";
import "./pages/room/room.page";
import "./pages/settings/settings.page";
import "./app";

import { consume } from "@lit/context";
import "./components/app/Nav";
import { logger } from "./components/app/_services/logger.service";
import { UserController } from "./controllers/user.controller";
import { authGuard, keyGuard } from "./guards/auth.guard";
import type { User } from "./interfaces/user.interface";
import { userContext } from "./providers/user.provider";

@customElement("app-router")
class AppRouter extends LitElement {
  static styles = styles;

  @consume({ context: userContext, subscribe: true })
  user?: User | null;

  private userController = new UserController(this);

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
      path: "/voice/:id",
      render: ({ id }) =>
        html`<voice-app roomId=${id ?? ""} @navigate=${this.onNavigate}></voice-app>`,
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
      <app-nav .path=${window.location.pathname} @logout=${this.handleLogout}></app-nav>

      <main>${this.router.outlet()}</main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-router": AppRouter;
  }
}
