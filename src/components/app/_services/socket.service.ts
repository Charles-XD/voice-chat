import { io, Socket } from "socket.io-client";

class SocketService {
  socket: Socket;

  private listeners: Set<(connected: boolean, latency: number) => void> = new Set();

  private latency = 0;
  private pingInterval?: number;

  constructor() {
    this.socket = io(import.meta.env.VITE_WEB_SOCKET_SERVER, {
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      this.startPing();
      this.emit(true);
    });

    this.socket.on("disconnect", () => {
      this.stopPing();
      this.emit(false);
    });

    this.socket.on("pong", (sentTime: number) => {
      this.latency = Date.now() - sentTime;
      this.emit(this.socket.connected);
    });
  }

  private startPing() {
    this.pingInterval = window.setInterval(() => {
      const sentTime = Date.now();
      this.socket.emit("ping-check", sentTime);
    }, 1000);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
  }

  private emit(connected: boolean) {
    this.listeners.forEach((l) => l(connected, this.latency));
  }

  onChange(listener: (connected: boolean, latency: number) => void) {
    this.listeners.add(listener);
    listener(this.socket.connected, this.latency);

    return () => this.listeners.delete(listener);
  }
}

export const socketService = new SocketService();