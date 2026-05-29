import { consume } from "@lit/context";
import { Task } from "@lit/task";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { getUser } from "../../api";
import { hasKey, isGuest } from "../../guards/access";
import type { User } from "../../interfaces/user.interface";
import { userContext } from "../../providers/user.provider";

@customElement("room-page")
export class RoomPage extends LitElement {
  @property()
  roomId: string = "";

  @consume({ context: userContext, subscribe: true })
  user?: User | null;

  private _apiTask = new Task(
    this,
    ([user]) => {
      if (!user?.key) return user;
      if (user?.key && user?.name) return user;
      return getUser(user.key).then((data) => ({ ...user, name: data.name ?? undefined }));
    },
    () => [this.user],
  );

  renderUser() {
    if (!this.user) return;
    const userName = this._apiTask.render({
      pending: () => html`Loading...`,
      complete: (user) => html`${user?.name}`,
    });

    return html`<p>User name in redis: ${userName}</p>`;
  }

  render() {
    return html`
      <h1>Room Page</h1>
      <p>Room id: ${this.roomId}</p>

      ${
        hasKey(this.user)
          ? html`<p>Logged in as: ${this.user?.key}</p>
            ${this.renderUser()}`
          : isGuest(this.user)
            ? html`<p>Guest: ${this.user?.name}</p>`
            : html`Not logged in`
      }
    `;
  }
}
