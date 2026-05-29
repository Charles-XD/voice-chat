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
    this.socket = io(import.meta.env.VITE_WEB_SOCKET_SERVER, {
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

  async joinRoom(room: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const join = this.socket.emit("join-room", room, (res: { success: boolean }) => {
        if (res.success) {
          resolve(res.success);
        } else {
          reject();
        }
      });

      join.connected ? resolve(true) : reject();
    });
  }

  async leaveRoom(room: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const leave = this.socket.emit("leave-room", room, (res: { success: boolean }) => {
        if (res.success) {
          resolve(res.success);
        } else {
          reject();
        }
      });

      leave.connected ? resolve(true) : reject();
    });
  }
}

export const socketService = new SocketService();
