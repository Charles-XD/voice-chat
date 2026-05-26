import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Task } from "@lit/task";
import { consume } from "@lit/context";
import {
  userContext,
} from "../../providers/user.provider";
import { User } from "../../interfaces/user.interface";
import { UserController } from "../../controllers/user.controller";

@customElement("room-page")
export class RoomPage extends LitElement {
  @property()
  roomId: string = "";

  @consume({ context: userContext, subscribe: true })
  user?: User | null;

  private userController = new UserController(this);

  private _apiTask = new Task(
    this,
    ([user]) => {
      console.log(user);
      if (user?.key && user?.name) return user;
      return fetch(`http://localhost:4000/api?key=${user?.key}`).then(
        (response) => {
          return response.json().then((user) => {
            // this.userController.login(user);
            return user;
          });
        },
      );
    },
    () => [this.user],
  );

  renderUser() {
    if (!this.user) return;
    const userName = this._apiTask.render({
      pending: () => html`Loading...`,
      complete: (user) => html`${user.name}`,
    });

    return html`<p>User name in redis: ${userName}</p>`;
  }

  render() {
    return html`
      <h1>Room Page</h1>
      <p>Room id: ${this.roomId}</p>

      ${this.user
        ? html`<p>Logged in as: ${this.user.key}</p>
            ${this.renderUser()}`
        : // : this.isGuest
          // ? html`Guest mode`
          html`Not logged in`}
    `;
  }
}
