import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

import { consume } from "@lit/context";

import { User } from "../../interfaces/user.interface";
import { userContext } from "../../providers/user.provider";

@customElement("profile-page")
export class ProfilePage extends LitElement {
  @consume({ context: userContext, subscribe: true })
  user?: User | null;

  render() {
    return html`<p>
      User from context: ${this.user?.key} - ${this.user?.name}

      // TODO: Show more user info here and allow editing it
    </p>`;
  }
}
