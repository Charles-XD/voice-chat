import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

import styles from "./styles";
import { socketService } from "../../_services/socket.service";
import { logger } from "../../_services/logger.service";

@customElement("app-online-users-global")
export class GlobalUsers extends LitElement {
  static styles = styles;

  @state()
  private users: string[] = [];

  override connectedCallback(): void {
    super.connectedCallback();

    socketService.socket.on("connect", () => {
      logger.log("SUCCESS", "Connected in global users.");
    });

    socketService.socket.on("user-count-update", (data) => {
      logger.log("INFO", `Online users count: ${data}`);
      this.users = [data];
    })
  }

  override render() {
    return html`
      <p>Users</p>
      <div>${this.users.map(user => html`<p>${user}</p>`)}</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-online-users-global": GlobalUsers;
  }
}
