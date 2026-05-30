import { provide } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  type CallApi,
  callContext,
  type StartCallOptions,
} from "../components/app/_context/call.context";
import { logger } from "../components/app/_services/logger.service";
import { socketService } from "../components/app/_services/socket.service";

type SignalPayload = { sdp: RTCSessionDescriptionInit; from: string };
type IcePayload = { candidate: RTCIceCandidateInit; from: string };
type LeavePayload = { room: string; user: string };
type Client = { id: string } | string;

const TURN_URL = import.meta.env.VITE_TURN_URL;
const STUN_URL = import.meta.env.VITE_STUN_URL;

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    ...(STUN_URL ? [{ urls: STUN_URL }] : []),
    ...(TURN_URL
      ? [
          {
            urls: TURN_URL,
            username: import.meta.env.VITE_TURN_USERNAME,
            credential: import.meta.env.VITE_TURN_CREDENTIAL,
          },
        ]
      : []),
  ],
};

/**
 * Owns the live voice call: the local mic stream, one RTCPeerConnection per
 * remote member, and the <audio> elements that play their tracks. Because this
 * provider wraps the whole app (above the router), none of it is torn down when
 * the user navigates away from the room — the call simply keeps running.
 */
@customElement("call-provider")
export class CallProvider extends LitElement {
  static styles = css`
    :host {
      display: contents;
    }
    .remote-audio {
      display: none;
    }
  `;

  @state() private roomId: string | null = null;
  @state() private callTitle: string | null = null;
  @state() private muted = true;
  @state() private cameraOn = false;

  /** Remote audio streams keyed by peer id, rendered as <audio> elements. */
  @state() private remote: { id: string; stream: MediaStream }[] = [];

  private localStream: MediaStream | null = null;
  private peers = new Map<string, RTCPeerConnection>();

  // Voice-activity detection: one analyser per stream (keyed by socket id).
  private audioContext?: AudioContext;
  private analysers = new Map<
    string,
    {
      source: MediaStreamAudioSourceNode;
      analyser: AnalyserNode;
      data: Uint8Array<ArrayBuffer>;
      lastLoud: number;
    }
  >();
  private speaking = new Set<string>();
  private meterRaf?: number;

  // API actions are stable arrow fields so the provided value can reference
  // them safely. They must be declared before `call` (initialized from them).
  private start = async (options: StartCallOptions): Promise<void> => {
    const { roomId, title, name } = options;
    const muted = options.muted ?? true;

    // Switching to a different room: tear down the previous call first.
    if (this.roomId && this.roomId !== roomId) {
      this.teardown();
      await socketService.leaveRoom(this.roomId);
    }

    // Returning to the call we're already in: keep the existing peers/stream.
    if (this.roomId === roomId && this.localStream) {
      this.callTitle = title;
      this.publish();
      return;
    }

    await this.ensureLocalStream();
    this.applyMuted(muted);

    this.roomId = roomId;
    this.callTitle = title;
    this.muted = muted;
    this.publish();

    // The server replies with `all-clients`, which drives offer creation.
    await socketService.joinRoom(roomId, name, muted);

    // Meter our own mic so the local cell ripples while we talk.
    const selfId = socketService.socket.id;
    if (selfId && this.localStream) this.addAnalyser(selfId, this.localStream);
  };

  private leave = (): void => {
    const room = this.roomId;
    const title = this.callTitle ?? room;
    this.teardown();
    if (room) {
      socketService.leaveRoom(room);
      logger.log("ERROR", `Left the room (${title}).`);
    }
    this.roomId = null;
    this.callTitle = null;
    this.cameraOn = false;
    this.publish();
  };

  private setMuted = (muted: boolean): void => {
    this.muted = muted;
    this.applyMuted(muted);
    logger.log("INFO", muted ? "Mute" : "Unmute");
    socketService.socket.emit("mic-status", { muted });
    this.publish();
  };

  @provide({ context: callContext })
  @state()
  call: CallApi = this.snapshot();

  private snapshot(): CallApi {
    return {
      roomId: this.roomId,
      title: this.callTitle,
      muted: this.muted,
      cameraOn: this.cameraOn,
      active: Boolean(this.roomId),
      speaking: [...this.speaking],
      start: this.start,
      leave: this.leave,
      setMuted: this.setMuted,
    };
  }

  private publish(): void {
    this.call = this.snapshot();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    const s = socketService.socket;
    s.on("all-clients", this.handleAllClients);
    s.on("user-leave-room", this.handlePeerLeave);
    s.on("offer", this.handleOffer);
    s.on("answer", this.handleAnswer);
    s.on("ice-candidate", this.handleIce);
  }

  override disconnectedCallback(): void {
    const s = socketService.socket;
    s.off("all-clients", this.handleAllClients);
    s.off("user-leave-room", this.handlePeerLeave);
    s.off("offer", this.handleOffer);
    s.off("answer", this.handleAnswer);
    s.off("ice-candidate", this.handleIce);
    this.teardown();
    super.disconnectedCallback();
  }

  private async ensureLocalStream(): Promise<void> {
    if (this.localStream) return;
    try {
      // `mediaDevices` is undefined in an insecure context (non-HTTPS on a
      // non-localhost origin), which would otherwise throw here.
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("INSECURE_CONTEXT");
      }
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (_error) {
      // Don't fail the join — connect in listen-only mode so the user can still
      // hear others. (Serve over HTTPS to enable the microphone on the LAN.)
      this.localStream = null;
      logger.log(
        "ERROR",
        "Microphone unavailable — joined in listen-only mode (HTTPS is required to use your mic).",
      );
    }
  }

  private applyMuted(muted: boolean): void {
    const track = this.localStream?.getAudioTracks()[0];
    if (track) track.enabled = !muted;
  }

  private teardown(): void {
    for (const pc of this.peers.values()) pc.close();
    this.peers.clear();
    this.localStream?.getTracks().forEach((t) => {
      t.stop();
    });
    this.localStream = null;
    this.remote = [];
    this.stopMetering();
  }

  // ===== Voice-activity detection =====

  private addAnalyser(id: string, stream: MediaStream): void {
    if (stream.getAudioTracks().length === 0) return;
    if (!this.audioContext) this.audioContext = new AudioContext();
    // May start suspended until a user gesture; the join click qualifies.
    if (this.audioContext.state === "suspended") void this.audioContext.resume();
    if (this.analysers.has(id)) this.removeAnalyser(id);

    const source = this.audioContext.createMediaStreamSource(stream);
    const analyser = this.audioContext.createAnalyser();
    analyser.fftSize = 512;
    // Analyser is intentionally NOT connected to destination — playback comes
    // from the <audio> elements, this is only for level measurement.
    source.connect(analyser);

    this.analysers.set(id, {
      source,
      analyser,
      data: new Uint8Array(analyser.fftSize),
      lastLoud: 0,
    });
    this.startMetering();
  }

  private removeAnalyser(id: string): void {
    const node = this.analysers.get(id);
    if (node) {
      node.source.disconnect();
      this.analysers.delete(id);
    }
    if (this.speaking.delete(id)) this.publish();
    if (this.analysers.size === 0) this.stopMetering();
  }

  private startMetering(): void {
    if (this.meterRaf !== undefined) return;
    this.meterRaf = requestAnimationFrame(this.measure);
  }

  private stopMetering(): void {
    if (this.meterRaf !== undefined) {
      cancelAnimationFrame(this.meterRaf);
      this.meterRaf = undefined;
    }
    for (const node of this.analysers.values()) node.source.disconnect();
    this.analysers.clear();
    if (this.speaking.size) {
      this.speaking.clear();
      this.publish();
    }
    this.audioContext?.close();
    this.audioContext = undefined;
  }

  // Speech threshold + a short hangover so the ripple doesn't flicker between
  // syllables.
  private static readonly SPEECH_RMS = 0.025;
  private static readonly SPEECH_HANGOVER_MS = 300;

  private measure = (): void => {
    const now = performance.now();
    let changed = false;

    for (const [id, node] of this.analysers) {
      node.analyser.getByteTimeDomainData(node.data);
      let sum = 0;
      for (let i = 0; i < node.data.length; i++) {
        const v = (node.data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / node.data.length);
      if (rms > CallProvider.SPEECH_RMS) node.lastLoud = now;

      const isSpeaking = now - node.lastLoud < CallProvider.SPEECH_HANGOVER_MS;
      if (isSpeaking && !this.speaking.has(id)) {
        this.speaking.add(id);
        changed = true;
      } else if (!isSpeaking && this.speaking.has(id)) {
        this.speaking.delete(id);
        changed = true;
      }
    }

    if (changed) this.publish();
    this.meterRaf = requestAnimationFrame(this.measure);
  };

  private createPeer(peerId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    this.peers.set(peerId, pc);

    const stream = this.localStream;
    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    } else {
      // Listen-only: no mic to send, but still negotiate an audio m-line so we
      // receive everyone else's audio.
      pc.addTransceiver("audio", { direction: "recvonly" });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.socket.emit("ice-candidate", {
          candidate: event.candidate,
          target: peerId,
        });
      }
    };

    pc.ontrack = (event) => {
      const remoteStream = event.streams[0] ?? new MediaStream([event.track]);
      this.attachRemote(peerId, remoteStream);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        this.removePeer(peerId);
      }
    };

    return pc;
  }

  private async createOffer(peerId: string): Promise<void> {
    const pc = this.createPeer(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketService.socket.emit("offer", { sdp: offer, target: peerId });
  }

  private attachRemote(peerId: string, stream: MediaStream): void {
    const others = this.remote.filter((r) => r.id !== peerId);
    this.remote = [...others, { id: peerId, stream }];
    this.addAnalyser(peerId, stream);
  }

  private removePeer(peerId: string): void {
    const pc = this.peers.get(peerId);
    if (pc) {
      pc.close();
      this.peers.delete(peerId);
    }
    this.remote = this.remote.filter((r) => r.id !== peerId);
    this.removeAnalyser(peerId);
  }

  private handleAllClients = async (clients: Client[]): Promise<void> => {
    if (!this.roomId || !Array.isArray(clients)) return;
    for (const client of clients) {
      const id = typeof client === "string" ? client : client.id;
      if (!id || this.peers.has(id)) continue;
      await this.createOffer(id);
    }
  };

  private handleOffer = async ({ sdp, from }: SignalPayload): Promise<void> => {
    if (!this.roomId) return;
    const pc = this.peers.get(from) ?? this.createPeer(from);
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socketService.socket.emit("answer", { sdp: answer, target: from });
  };

  private handleAnswer = async ({ sdp, from }: SignalPayload): Promise<void> => {
    const pc = this.peers.get(from);
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  };

  private handleIce = ({ candidate, from }: IcePayload): void => {
    const pc = this.peers.get(from);
    if (pc && candidate) pc.addIceCandidate(new RTCIceCandidate(candidate));
  };

  private handlePeerLeave = (detail: LeavePayload): void => {
    this.removePeer(detail.user);
  };

  render() {
    return html`
      <slot></slot>
      ${this.remote.map(
        (r) => html`<audio class="remote-audio" autoplay .srcObject=${r.stream}></audio>`,
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "call-provider": CallProvider;
  }
}
