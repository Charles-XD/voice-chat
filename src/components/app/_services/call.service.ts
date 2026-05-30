export type ActiveCall = {
  roomId: string;
  title: string;
  muted: boolean;
  cameraOn: boolean;
};

class CallService {
  private call: ActiveCall | null = null;
  private listeners = new Set<(call: ActiveCall | null) => void>();

  get current(): ActiveCall | null {
    return this.call;
  }

  start(call: ActiveCall) {
    this.call = call;
    this.emit();
  }

  update(patch: Partial<ActiveCall>) {
    if (!this.call) return;
    this.call = { ...this.call, ...patch };
    this.emit();
  }

  end() {
    if (!this.call) return;
    this.call = null;
    this.emit();
  }

  subscribe(listener: (call: ActiveCall | null) => void) {
    this.listeners.add(listener);
    listener(this.call);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach((l) => {
      l(this.call);
    });
  }
}

export const callService = new CallService();
