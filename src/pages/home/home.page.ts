import { consume } from "@lit/context";
import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { userContext } from "../../providers/user.provider";
import { User } from "../../interfaces/user.interface";
import { UserController } from "../../controllers/user.controller";
import { routerService } from "../../components/app/_services/router.service";

import styles from "./styles";

@customElement("home-page")
export class HomePage extends LitElement {
  static styles = styles;

  @state() private apiKey: string = "";
  @state() private remember: boolean = false;

  @consume({ context: userContext, subscribe: true })
  @state()
  user?: User | null;

  private userController = new UserController(this);

  private handleUserNavigation() {
    const url = routerService.getSearchParams("origin") ?? "/";
    this.dispatchEvent(
      new CustomEvent("navigate", {
        detail: `${url}`,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private async handleEnterClick(e: Event) {
    e.preventDefault();

    const key = this.apiKey.trim();
    if (key.length === 0) return;

    await this.userController.login({ key }, this.remember);
    this.handleUserNavigation();
  }

  private handleGuestClick(e: Event) {
    e.preventDefault();
    this.handleUserNavigation();
  }

  private handleRememberChange(e: Event) {
    this.remember = (e.target as HTMLInputElement).checked;
  }

  private handleKeyChange(e: Event) {
    this.apiKey = (e.target as HTMLInputElement).value;
  }

  render() {
    return this.user?.loading
      ? html`Loading User ...`
      : this.user?.key
        ? html` <app-room-create></app-room-create>`
        : html`
            <h1>Collab Voice</h1>
            <p class="subtitle">Enter your <strong>KEY</strong> to start.</p>
            <form @submit=${this.handleEnterClick}>
              <ui-textfield
                class="textfield"
                .value=${this.apiKey}
                @onChange=${this.handleKeyChange}
              ></ui-textfield>

              <div class="remember">
                <input
                  type="checkbox"
                  id="remember"
                  .checked=${this.remember}
                  @change=${this.handleRememberChange}
                />
                <label for="remember">Remember me</label>
              </div>

              <ui-button type="submit">Start</ui-button>
              <span class="or">or</span>
              <ui-button @onClick=${this.handleGuestClick}
                >Guest Mode</ui-button
              >
            </form>
          `;
  }
}
