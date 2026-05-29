import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { AppSettings } from "../interfaces/settings.interface";
import { SETTINGS_CHANGE_EVENT } from "../providers/settings.provider";

export class SettingsController implements ReactiveController {
  host: ReactiveControllerHost & Element;

  constructor(host: ReactiveControllerHost & Element) {
    this.host = host;
    this.host.addController(this);
  }

  hostConnected() {}
  hostDisconnected() {}

  /** Merge a partial update into the global settings context. */
  public update(patch: Partial<AppSettings>) {
    this.host.dispatchEvent(
      new CustomEvent<Partial<AppSettings>>(SETTINGS_CHANGE_EVENT, {
        detail: patch,
        bubbles: true,
        composed: true, // Required to cross Shadow DOM boundaries
      }),
    );
  }
}
