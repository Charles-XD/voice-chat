import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createRef, ref } from 'lit/directives/ref.js';
import { type Log, logger } from "../_services/logger.service";
import styles from "./styles";

@customElement('app-logs')
export class Logs extends LitElement {
  static styles = styles;

  @state()
  private appLogs: Log[] = [];

  @state()
  private canAutoScroll: boolean = true;

  @property({ attribute: false })
  private maxLines: number = 50;

  private isProgrammaticScroll = false;
  private logsRef = createRef<HTMLDivElement>();

  private isAtBottom(el: HTMLElement) {
    return Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 100;
  }

  private handleScroll() {
    const el = this.logsRef.value;
    if (!el || this.isProgrammaticScroll) return;

    this.canAutoScroll = this.isAtBottom(el);
  }

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

  override firstUpdated() {
    const el = this.logsRef.value;
    if (!el) return;

    el.addEventListener('wheel', () => {
      const el = this.logsRef.value;
      this.canAutoScroll = el ? this.isAtBottom(el) : false;
    }, { passive: true });

    el.addEventListener('touchmove', () => {
      const el = this.logsRef.value;
      this.canAutoScroll = el ? this.isAtBottom(el) : false;
    }, { passive: true });
  }

  override updated(changed: Map<string, unknown>) {
    if (!changed.has('appLogs')) return;
    if (!this.canAutoScroll) return;

    const el = this.logsRef.value;
    if (!el) return;

    this.isProgrammaticScroll = true;

    queueMicrotask(() => {
      el.scrollTop = el.scrollHeight;

      requestAnimationFrame(() => {
        this.isProgrammaticScroll = false;
      });
    });
  }

  override render() {
    return html`
    <div 
      class="logs" 
      ${ref(this.logsRef)}
      @scroll=${this.handleScroll}
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