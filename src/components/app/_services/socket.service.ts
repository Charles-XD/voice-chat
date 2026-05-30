import { io, type Socket } from "socket.io-client";
import { logger } from "./logger.service";

export type SocketConnectionStatus = "connecting" | "connected" | "reconnecting" | "disconnected";

class SocketService {
  socket: Socket;

  private listeners: Set<(connected: boolean, latency: number) => void> = new Set();
  private statusListeners: Set<(status: SocketConnectionStatus, latency: number) => void> =
    new Set();

  private latency = 0;
  private pingInterval?: number;
  private status: SocketConnectionStatus = "connecting";

  constructor() {
    // Connect to the page's own origin by default; the Vite dev server proxies
    // `/socket.io` (with ws upgrade) to the backend. Override with
    // VITE_WEB_SOCKET_SERVER to target an explicit server.
    const socketUrl = import.meta.env.VITE_WEB_SOCKET_SERVER || window.location.origin;

    this.socket = io(socketUrl, {
      autoConnect: true,
    });

    this.setStatus(this.socket.connected ? "connected" : "connecting");

    this.socket.on("connect", () => {
      this.startPing();
      this.setStatus("connected");
      this.emit(true);
      logger.log("SUCCESS", "Connected.");
    });

    this.socket.on("disconnect", () => {
      this.stopPing();
      this.setStatus("disconnected");
      this.emit(false);
      logger.log("ERROR", "Disconnected.");
    });

    this.socket.io.on("reconnect_attempt", () => {
      this.setStatus("reconnecting");
    });

    this.socket.io.on("reconnect", () => {
      this.setStatus("connected");
    });

    this.socket.io.on("reconnect_failed", () => {
      this.setStatus("disconnected");
    });

    this.socket.io.on("error", () => {
      this.setStatus(this.socket.active ? "reconnecting" : "disconnected");
    });

    this.socket.on("pong", (sentTime: number) => {
      this.latency = Date.now() - sentTime;
      this.emit(this.socket.connected);
      this.emitStatus();
    });
  }

  private startPing() {
    this.pingInterval = window.setInterval(() => {
      const sentTime = Date.now();
      this.socket.emit("ping-check", sentTime);
    }, 2000);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
  }

  private emit(connected: boolean) {
    this.listeners.forEach((l) => {
      l(connected, this.latency);
    });
  }

  private emitStatus() {
    this.statusListeners.forEach((l) => {
      l(this.status, this.latency);
    });
  }

  private setStatus(next: SocketConnectionStatus) {
    if (this.status === next) return;
    this.status = next;
    this.emitStatus();
  }

  onChange(listener: (connected: boolean, latency: number) => void) {
    this.listeners.add(listener);
    listener(this.socket.connected, this.latency);

    return () => this.listeners.delete(listener);
  }

  onStatusChange(listener: (status: SocketConnectionStatus, latency: number) => void) {
    this.statusListeners.add(listener);
    listener(this.status, this.latency);

    return () => this.statusListeners.delete(listener);
  }

  /**
   * Resolves once the socket is connected. On a fresh page load the socket may
   * still be connecting (notably slower in Firefox), so we wait for the
   * `connect` event instead of assuming it's ready.
   */
  whenConnected(timeoutMs = 15000): Promise<void> {
    if (this.socket.connected) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const onConnect = () => {
        cleanup();
        resolve();
      };
      const timer = window.setTimeout(() => {
        cleanup();
        reject(new Error("CONNECT_TIMEOUT"));
      }, timeoutMs);
      const cleanup = () => {
        window.clearTimeout(timer);
        this.socket.off("connect", onConnect);
      };

      this.socket.on("connect", onConnect);
      // No-op if a connection attempt is already in flight.
      this.socket.connect();
    });
  }

  async joinRoom(room: string, name?: string, muted = true): Promise<boolean> {
    // Wait until the socket is actually connected before emitting; emitting
    // against a still-connecting socket previously failed the join.
    await this.whenConnected();
    this.socket.emit("join-room", { room, name, muted });
    return true;
  }

  async leaveRoom(room: string): Promise<boolean> {
    if (!this.socket.connected) return false;
    this.socket.emit("leave-room", room);
    return true;
  }
}

export const socketService = new SocketService();
