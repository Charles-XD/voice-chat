import { consume } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { routerService } from "../../components/app/_services/router.service";
import { UserController } from "../../controllers/user.controller";
import { hasKey, isGuest } from "../../guards/access";
import type { User } from "../../interfaces/user.interface";
import { userContext } from "../../providers/user.provider";

const GUEST_LANDING = "/join";

import styles from "./styles";

@customElement("home-page")
export class HomePage extends LitElement {
  static styles = styles;

  @state() private apiKey: string = "";
  @state() private guestName: string = "";
  @state() private keyError: string = "";
  @state() private nameError: string = "";
  @state() private submitting: boolean = false;

  @consume({ context: userContext, subscribe: true })
  @state()
  user?: User | null;

  private userController = new UserController(this);

  private navigate(url: string) {
    this.dispatchEvent(
      new CustomEvent("navigate", {
        detail: url,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleUserNavigation() {
    this.navigate(routerService.getSearchParams("origin") ?? "/");
  }

  private async handleEnterSubmit(e: Event) {
    e.preventDefault();

    const key = this.apiKey.trim();
    if (key.length === 0) {
      this.keyError = "Key is required.";
      return;
    }
    this.keyError = "";

    this.submitting = true;
    let resolved: User | null = null;
    try {
      resolved = await this.userController.login({ key });
    } finally {
      this.submitting = false;
    }

    // Only proceed once the API confirms the user exists.
    if (!resolved?.name) {
      this.keyError = "Invalid key.";
      return;
    }

    this.resetForms();
    this.handleUserNavigation();
  }

  private handleGuestSubmit(e: Event) {
    e.preventDefault();

    const name = this.guestName.trim();
    if (name.length === 0) {
      this.nameError = "Name is required.";
      return;
    }
    this.nameError = "";

    this.userController.guest(name);
    this.resetForms();
    this.navigate(routerService.getSearchParams("origin") ?? GUEST_LANDING);
  }

  private resetForms() {
    this.apiKey = "";
    this.guestName = "";
    this.keyError = "";
    this.nameError = "";
  }

  private handleKeyChange(e: CustomEvent<string>) {
    this.apiKey = e.detail;
    if (this.keyError) this.keyError = "";
  }

  private handleNameChange(e: CustomEvent<string>) {
    this.guestName = e.detail;
    if (this.nameError) this.nameError = "";
  }

  private renderGuestLanding() {
    return html`
      <div class="card guest">
        <h2>You're in guest mode</h2>
        <p class="subtitle">
          Guest access is limited. You can join an existing room — features that
          need an account key are unavailable.
        </p>
        <ui-button @onClick=${() => this.navigate(GUEST_LANDING)}>
          Go to Join
        </ui-button>
      </div>
    `;
  }

  render() {
    // While submitting, keep showing the form so the loading button is visible
    // and we don't swap to <app-room-create> before the fetch resolves.
    if (!this.submitting) {
      if (this.user?.loading) return html`Loading User ...`;
      if (hasKey(this.user)) return html`<app-room-create></app-room-create>`;
      if (isGuest(this.user)) return this.renderGuestLanding();
    }

    return html`
      <h1 class="title">Collab Voice</h1>

      <div class="card">
        <div class="grid">
          <section class="col">
            <h2>Sign in with your key</h2>

            <form @submit=${this.handleEnterSubmit} novalidate>
              <ui-textfield
                label="Key"
                placeholder="Enter your key"
                required
                .value=${this.apiKey}
                .error=${this.keyError}
                @onChange=${this.handleKeyChange}
              ></ui-textfield>

              <div class="spacer"></div>
              <ui-button type="submit" ?loading=${this.submitting}>Start</ui-button>
            </form>
          </section>

          <div class="divider" role="separator" aria-orientation="vertical">
            <span>or</span>
          </div>

          <section class="col">
            <h2>Continue as guest with a name</h2>

            <form @submit=${this.handleGuestSubmit} novalidate>
              <ui-textfield
                label="Name"
                placeholder="Enter your name"
                required
                .value=${this.guestName}
                .error=${this.nameError}
                @onChange=${this.handleNameChange}
              ></ui-textfield>

              <div class="spacer"></div>
              <ui-button type="submit" color="secondary">Continue as Guest</ui-button>
            </form>
          </section>
        </div>
      </div>
    `;
  }
}
