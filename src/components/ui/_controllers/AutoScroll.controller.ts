import { ReactiveController, ReactiveControllerHost } from "lit";
import { Ref } from "lit/directives/ref.js";

export class AutoScrollController implements ReactiveController {
  private host: ReactiveControllerHost;
  private scrollRef: Ref<HTMLElement>;

  disableAutoScroll = false;
  private isProgrammaticScroll = false;
  private boundScrollHandler = this.handleScroll.bind(this);

  constructor(host: ReactiveControllerHost, ref: Ref<HTMLElement>) {
    this.host = host;
    this.scrollRef = ref;
    host.addController(this);
  }

  private isAtBottom(el: HTMLElement) {
    return Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 100;
  }

  private handleScroll() {
    const el = this.scrollRef.value;
    if (!el || this.isProgrammaticScroll) return;

    this.disableAutoScroll = !this.isAtBottom(el);
  }

  hostUpdated() {
    const el = this.scrollRef.value;
    if (!el) return;

    el.removeEventListener("scroll", this.boundScrollHandler);
    el.addEventListener("scroll", this.boundScrollHandler);

    if (!this.disableAutoScroll) {
      this.scrollToBottom();
    }
  }

  hostDisconnected() {
    const el = this.scrollRef.value;
    if (!el) return;

    el.removeEventListener("scroll", this.boundScrollHandler);
  }

  scrollToBottom() {
    const el = this.scrollRef.value;
    if (!el) return;

    this.isProgrammaticScroll = true;

    el.scrollTop = el.scrollHeight;

    requestAnimationFrame(() => {
      this.isProgrammaticScroll = false;
    });
  }

  public onScroll() {
    this.handleScroll();
  }
}
