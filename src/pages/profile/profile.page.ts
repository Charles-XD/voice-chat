import { consume } from "@lit/context";
import { html, LitElement, type PropertyValues } from "lit";
import { customElement, state } from "lit/decorators.js";

import { UserController } from "../../controllers/user.controller";
import type { User } from "../../interfaces/user.interface";
import { userContext } from "../../providers/user.provider";
import styles from "./styles";

@customElement("profile-page")
export class ProfilePage extends LitElement {
  static styles = styles;

  @consume({ context: userContext, subscribe: true })
  @state()
  user?: User | null;

  private userController = new UserController(this);

  @state() private name = "";
  @state() private error = "";
  @state() private success = false;
  @state() private saving = false;
  @state() private initialized = false;

  private successTimer?: number;

  override disconnectedCallback(): void {
    if (this.successTimer) window.clearTimeout(this.successTimer);
    super.disconnectedCallback();
  }

  private showSuccess() {
    this.success = true;
    if (this.successTimer) window.clearTimeout(this.successTimer);
    this.successTimer = window.setTimeout(() => {
      this.success = false;
    }, 3000);
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    // Seed the input from the current user once it's available.
    if (!this.initialized && changed.has("user") && this.user?.name) {
      this.name = this.user.name;
      this.initialized = true;
    }
  }

  private handleChange(e: CustomEvent<string>) {
    this.name = e.detail;
    if (this.error) this.error = "";
    if (this.success) {
      this.success = false;
      if (this.successTimer) window.clearTimeout(this.successTimer);
    }
  }

  private async handleSubmit(e: Event) {
    e.preventDefault();

    const name = this.name.trim();
    if (name.length === 0) {
      this.error = "Name is required.";
      return;
    }
    if (name === this.user?.name) return;
    this.error = "";

    this.saving = true;
    let resolved: User | null = null;
    try {
      resolved = await this.userController.updateName(name);
    } finally {
      this.saving = false;
    }

    if (!resolved) {
      this.error = "Could not update your name. Please try again.";
      return;
    }

    this.showSuccess();
  }

  override render() {
    return html`
      <div class="card">
        <h1 class="title">Profile</h1>
        <p class="subtitle">Update the display name other people see.</p>

        <form @submit=${this.handleSubmit} novalidate>
          <ui-textfield
            label="Display name"
            placeholder="Enter your name"
            required
            .value=${this.name}
            .error=${this.error}
            @onChange=${this.handleChange}
          ></ui-textfield>

          ${this.success ? html`<p class="success" role="status">Your name has been updated.</p>` : null}

          <ui-button type="submit" ?loading=${this.saving}>Save changes</ui-button>
        </form>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "profile-page": ProfilePage;
  }
}
