import { LitElement, ReactiveController, ReactiveControllerHost } from "lit";
import { User } from "../interfaces/user.interface";
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
      const response = await fetch(`http://localhost:4000/api?key=${user.key}`, {
        // headers: { Authorization: `Bearer ${key}` }
      });
      
      if (!response.ok) throw new Error("Session expired");
      const fullUserData = await response.json();

      const resolved: User = { ...user, ...fullUserData, loading: false };

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
    this.dispatch({ key: "", name, isGuest: true });
  }

  public logout() {
    localStorage.removeItem(USER_KEY);
    this.dispatch(null);
  }
}