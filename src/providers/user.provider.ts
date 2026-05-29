import { createContext, provide } from "@lit/context";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import type { User } from "../interfaces/user.interface";

export const userContext = createContext<User | null>(Symbol("user-context"));
export const USER_CHANGE_EVENT = "user-change-event";
export const USER_KEY = "userKey";

@customElement("user-provider")
export class UserProvider extends LitElement {
  private userKey = localStorage.getItem(USER_KEY);

  @provide({ context: userContext })
  @state()
  user: User | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(USER_CHANGE_EVENT, this.handleUserChange as EventListener);

    if (this.userKey) {
      this._hydrateUser(this.userKey);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(USER_CHANGE_EVENT, this.handleUserChange as EventListener);
  }

  private async _hydrateUser(key: string) {
    try {
      this.user = { ...this.user, key, loading: true };
      const response = await fetch(`http://localhost:4000/api?key=${key}`);

      if (!response.ok) throw new Error("Session expired");
      const fullUserData = await response.json();

      this.user = { ...this.user, key, ...fullUserData, loading: false };
    } catch (error) {
      console.error("Failed to hydrate user session:", error);
      localStorage.removeItem(USER_KEY);
      this.user = null;

      if (window.location.pathname !== "/") {
        window.location.replace("/");
      }
    }
  }

  private handleUserChange = (e: CustomEvent<User | null>) => {
    console.log("User status changed:", e.detail);
    if (!e.detail) {
      this.user = null;
    } else {
      this.user = {
        ...this.user,
        ...e.detail,
      };
    }
  };

  render() {
    return html`<slot></slot>`;
  }
}
