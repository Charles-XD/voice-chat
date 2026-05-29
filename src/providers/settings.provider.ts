import { createContext, provide } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { type AppSettings, DEFAULT_SETTINGS } from "../interfaces/settings.interface";

export const settingsContext = createContext<AppSettings>(Symbol("settings-context"));
export const SETTINGS_CHANGE_EVENT = "settings-change-event";
export const SETTINGS_KEY = "appSettings";

@customElement("settings-provider")
export class SettingsProvider extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
  `;

  @provide({ context: settingsContext })
  @state()
  settings: AppSettings = DEFAULT_SETTINGS;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(SETTINGS_CHANGE_EVENT, this.handleSettingsChange as EventListener);
    this.settings = this._loadSettings();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(SETTINGS_CHANGE_EVENT, this.handleSettingsChange as EventListener);
  }

  private _loadSettings(): AppSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return DEFAULT_SETTINGS;
      // Merge over defaults so newly added settings keep sane values.
      return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
    } catch (error) {
      console.error("Failed to load settings:", error);
      return DEFAULT_SETTINGS;
    }
  }

  private _persist(settings: AppSettings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to persist settings:", error);
    }
  }

  private handleSettingsChange = (e: CustomEvent<Partial<AppSettings>>) => {
    this.settings = { ...this.settings, ...e.detail };
    this._persist(this.settings);
  };

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "settings-provider": SettingsProvider;
  }
}
