import type { ReactiveController, ReactiveControllerHost } from "lit";
import { getUser, updateUserName } from "../api";
import type { User } from "../interfaces/user.interface";
import { USER_CHANGE_EVENT, USER_KEY } from "../providers/user.provider";

export class UserController implements ReactiveController {
  host: ReactiveControllerHost & Element;

  constructor(host: ReactiveControllerHost & Element) {
    this.host = host;
    this.host.addController(this);
  }

  hostConnected() {}
  hostDisconnected() {}

  private dispatch(user: User | null) {
    this.host.dispatchEvent(
      new CustomEvent<User | null>(USER_CHANGE_EVENT, {
        detail: user,
        bubbles: true,
        composed: true, // Required to cross Shadow DOM boundaries
      }),
    );
  }

  public async login(user: User): Promise<User | null> {
    try {
      if (!user.key) throw new Error("Missing key");
      const data = await getUser(user.key);

      const resolved: User = { ...user, name: data.name ?? undefined, loading: false };

      // Only consider the user signed in once the API confirms they exist.
      if (!resolved.name) throw new Error("User not found");

      localStorage.setItem(USER_KEY, user.key);
      this.dispatch(resolved);
      return resolved;
    } catch (error) {
      console.error("Failed to hydrate user session:", error);
      localStorage.removeItem(USER_KEY);
      this.dispatch(null);
      return null;
    }
  }

  public guest(name: string) {
    this.dispatch({ name, isGuest: true });
  }

  public async updateName(name: string): Promise<User | null> {
    const key = localStorage.getItem(USER_KEY);
    if (!key) return null;

    try {
      const data = await updateUserName(key, name);

      const resolved: User = { key, name: data.name ?? undefined };
      this.dispatch(resolved);
      return resolved;
    } catch (error) {
      console.error("Failed to update profile name:", error);
      return null;
    }
  }

  public logout() {
    localStorage.removeItem(USER_KEY);
    this.dispatch(null);
  }
}
