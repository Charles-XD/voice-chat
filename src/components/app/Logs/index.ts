import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createRef, ref } from 'lit/directives/ref.js';
import { type Log, logger } from "../_services/logger.service";

import styles from "./styles";
import { AutoScrollController } from "../../ui/_controllers/AutoScroll.controller";

@customElement('app-logs')
export class Logs extends LitElement {
  static styles = styles;

  @state()
  private appLogs: Log[] = [];

  @property({ attribute: false })
  private maxLines: number = 50;

  private logsRef = createRef<HTMLDivElement>();
  
  private autoScroll = new AutoScrollController(this, this.logsRef);
  private onScroll = this.autoScroll.onScroll.bind(this.autoScroll);
  private scrollToBottom = this.autoScroll.scrollToBottom.bind(this.autoScroll);

  private unsubscribe?: () => void;

  override connectedCallback(): void {
    super.connectedCallback();

    this.unsubscribe = logger.subscribe((logs) => {
      this.appLogs = logs.slice(-this.maxLines);
    });
  }

  override disconnectedCallback(): void {
    this.unsubscribe?.();

    super.disconnectedCallback();
  }

  override updated(changed: Map<string, unknown>) {
    if (!changed.has('appLogs')) return;
    if (this.autoScroll.disableAutoScroll) return;

    this.scrollToBottom();
  }

  override render() {
    return html`
    <div 
      class="logs" 
      ${ref(this.logsRef)}
      @scroll=${this.onScroll}
    >
      <div class="title">Logs</div>

      <ul class="list">
        ${this.appLogs.map(
      (l) => html`
            <li class="log log-${l.level.toLowerCase()}">
              <div class="meta">
                <span class="level">${l.level}</span>
                <span class="time">
                  ${new Date(l.loggedAt).toLocaleTimeString()}
                </span>
              </div>

              <div class="message">${l.message}</div>
            </li>
          `
    )}
      </ul>
    </div>
  `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-logs": Logs;
  }
}