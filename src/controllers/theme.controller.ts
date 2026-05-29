import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { Theme } from "../interfaces/theme.interface";
import { THEME_CHANGE_EVENT } from "../providers/theme.provider";

export class ThemeController implements ReactiveController {
  host: ReactiveControllerHost & Element;

  constructor(host: ReactiveControllerHost & Element) {
    this.host = host;
    this.host.addController(this);
  }

  hostConnected() {}
  hostDisconnected() {}

  public set(theme: Theme) {
    this.host.dispatchEvent(
      new CustomEvent<Theme>(THEME_CHANGE_EVENT, {
        detail: theme,
        bubbles: true,
        composed: true, // Required to cross Shadow DOM boundaries
      }),
    );
  }

  public toggle(current: Theme) {
    this.set(current === "dark" ? "light" : "dark");
  }
}
