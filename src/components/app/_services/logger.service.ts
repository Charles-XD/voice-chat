export interface Log {
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  message: string;
  loggedAt: Date;
}

class Logger {
  private logs: Set<Log> = new Set();
  private listeners: Set<(logs: Log[]) => void> = new Set();

  log(level: Log['level'], message: Log['message']) {
    this.logs.add({
      level,
      message,
      loggedAt: new Date(),
    });
    this.emit();
  }

  remove(log: Log) {
    this.logs.delete(log);
    this.emit();
  }

  clear() {
    this.logs.clear();
    this.emit();
  }

  subscribe(listener: (logs: Log[]) => void) {
    this.listeners.add(listener);

    listener([...this.logs]);

    return () => this.listeners.delete(listener);
  }

  private emit() {
    const snapshot = [...this.logs];
    this.listeners.forEach((l) => l(snapshot));
  }
}

export const logger = new Logger();