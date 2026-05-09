import { ReactiveController, ReactiveControllerHost } from "lit";
import { createRef, Ref } from "lit/directives/ref.js";

export class AutoScrollController implements ReactiveController {
  host: ReactiveControllerHost;

  disableAutoScroll: boolean = false; 
  isProgrammaticScroll: boolean = false;
  scrollRef = createRef<HTMLElement>();

  constructor(host: ReactiveControllerHost, ref: Ref<HTMLElement>) {
    (this.host = host).addController(this);
    this.scrollRef = ref;
  }

  private isAtBottom(el: HTMLElement) {
    return Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 100;
  }

  private handleScroll() {
    const el = this.scrollRef.value;
    if (!el || this.isProgrammaticScroll) return;

    this.disableAutoScroll = !this.isAtBottom(el);
  }

  hostConnected() {
    const el = this.scrollRef.value;
    if (!el) return;

    el.addEventListener('wheel', () => {
      const el = this.scrollRef.value;
      this.disableAutoScroll = el ? !this.isAtBottom(el) : true;
    }, { passive: true });

    el.addEventListener('touchmove', () => {
      const el = this.scrollRef.value;
      this.disableAutoScroll = el ? !this.isAtBottom(el) : true;
    }, { passive: true });
  }

  hostDisconnected() {
    const el = this.scrollRef.value;
    if (!el) return;

    el.removeEventListener('wheel', () => {});
    el.removeEventListener('touchmove', () => {});
  }

  hostUpdated() {
    if (this.disableAutoScroll) return;

    const el = this.scrollRef.value;
    if (!el) return;

    this.isProgrammaticScroll = true;

    queueMicrotask(() => {
      el.scrollTop = el.scrollHeight;

      requestAnimationFrame(() => {
        this.isProgrammaticScroll = false;
      });
    });
  }
}