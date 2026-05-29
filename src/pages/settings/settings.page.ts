import { consume } from "@lit/context";
import { html, LitElement, type PropertyValues } from "lit";
import { customElement, query, state } from "lit/decorators.js";

import { SettingsController } from "../../controllers/settings.controller";
import type { AppSettings } from "../../interfaces/settings.interface";
import { settingsContext } from "../../providers/settings.provider";

import styles from "./styles";

type SinkCapableAudio = HTMLAudioElement & {
  setSinkId?: (sinkId: string) => Promise<void>;
};

@customElement("settings-page")
export class SettingsPage extends LitElement {
  static styles = styles;

  @consume({ context: settingsContext, subscribe: true })
  @state()
  settings!: AppSettings;

  private settingsController = new SettingsController(this);

  @query("video") private videoEl?: HTMLVideoElement;

  @state() private cameras: MediaDeviceInfo[] = [];
  @state() private microphones: MediaDeviceInfo[] = [];
  @state() private speakers: MediaDeviceInfo[] = [];
  @state() private micLevel = 0;
  @state() private error = "";

  private stream: MediaStream | null = null;
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private rafId = 0;
  private applying = false;
  private streamSignature = "";

  override connectedCallback(): void {
    super.connectedCallback();
    navigator.mediaDevices?.addEventListener("devicechange", this.refreshDevices);
  }

  override disconnectedCallback(): void {
    navigator.mediaDevices?.removeEventListener("devicechange", this.refreshDevices);
    this.teardownStream();
    super.disconnectedCallback();
  }

  protected override firstUpdated(): void {
    void this.init();
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (!changed.has("settings")) return;
    // Only rebuild the media stream when an input-affecting setting changed.
    const signature = this.computeSignature(this.settings);
    if (signature !== this.streamSignature) {
      void this.applyStream();
    }
  }

  private computeSignature(s: AppSettings): string {
    return [
      s.cameraEnabled,
      s.micEnabled,
      s.cameraId ?? "",
      s.microphoneId ?? "",
      s.noiseSuppression,
      s.echoCancellation,
      s.autoGainControl,
    ].join("|");
  }

  private async init() {
    try {
      await this.applyStream();
      await this.refreshDevices();
    } catch (error) {
      console.error("Failed to initialise media devices:", error);
      this.error =
        "We couldn't access your camera or microphone. Check your browser permissions and try again.";
    }
  }

  private refreshDevices = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    this.cameras = devices.filter((d) => d.kind === "videoinput");
    this.microphones = devices.filter((d) => d.kind === "audioinput");
    this.speakers = devices.filter((d) => d.kind === "audiooutput");
  };

  private async applyStream() {
    if (this.applying) return;
    this.applying = true;

    try {
      this.teardownStream();
      this.streamSignature = this.computeSignature(this.settings);

      const { cameraEnabled, micEnabled, cameraId, microphoneId } = this.settings;

      const video: MediaStreamConstraints["video"] = cameraEnabled
        ? cameraId
          ? { deviceId: { exact: cameraId } }
          : true
        : false;

      const audio: MediaStreamConstraints["audio"] = micEnabled
        ? {
            deviceId: microphoneId ? { exact: microphoneId } : undefined,
            noiseSuppression: this.settings.noiseSuppression,
            echoCancellation: this.settings.echoCancellation,
            autoGainControl: this.settings.autoGainControl,
          }
        : false;

      if (!video && !audio) return;

      const stream = await navigator.mediaDevices.getUserMedia({ video, audio });
      this.stream = stream;
      this.error = "";

      if (this.videoEl) this.videoEl.srcObject = stream;

      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) this.setupMeter(stream);
      else this.micLevel = 0;
    } catch (error) {
      console.error("Failed to start media stream:", error);
      this.error = "We couldn't access the selected devices. They may be in use or unavailable.";
    } finally {
      this.applying = false;
    }
  }

  private setupMeter(stream: MediaStream) {
    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    source.connect(this.analyser);

    const data = new Uint8Array(this.analyser.frequencyBinCount);

    const tick = () => {
      if (!this.analyser) return;
      this.analyser.getByteTimeDomainData(data);

      let sum = 0;
      for (const value of data) {
        const centered = (value - 128) / 128;
        sum += centered * centered;
      }
      const rms = Math.sqrt(sum / data.length);
      // Scale up so normal speech fills most of the bar.
      this.micLevel = Math.min(1, rms * 3);

      this.rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  private teardownStream() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;

    this.analyser?.disconnect();
    this.analyser = undefined;

    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = undefined;
    }

    if (this.stream) {
      for (const track of this.stream.getTracks()) track.stop();
      this.stream = null;
    }

    this.micLevel = 0;
  }

  private onCameraChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    this.settingsController.update({ cameraId: value || undefined });
  }

  private onMicChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    this.settingsController.update({ microphoneId: value || undefined });
  }

  private onSpeakerChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    this.settingsController.update({ speakerId: value || undefined });
  }

  private toggle(key: keyof AppSettings) {
    return (e: Event) => {
      const checked = (e.target as HTMLInputElement).checked;
      this.settingsController.update({ [key]: checked } as Partial<AppSettings>);
    };
  }

  private async testSpeaker() {
    try {
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const destination = ctx.createMediaStreamDestination();

      oscillator.frequency.value = 440;
      gain.gain.value = 0.1;
      oscillator.connect(gain);
      gain.connect(destination);

      const audio = new Audio() as SinkCapableAudio;
      audio.srcObject = destination.stream;
      if (this.settings.speakerId && typeof audio.setSinkId === "function") {
        await audio.setSinkId(this.settings.speakerId);
      }

      oscillator.start();
      await audio.play();

      window.setTimeout(() => {
        oscillator.stop();
        void ctx.close();
      }, 450);
    } catch (error) {
      console.error("Failed to test speaker:", error);
    }
  }

  private deviceLabel(device: MediaDeviceInfo, fallback: string, index: number): string {
    return device.label || `${fallback} ${index + 1}`;
  }

  private renderSelect(
    devices: MediaDeviceInfo[],
    selected: string | undefined,
    fallback: string,
    onChange: (e: Event) => void,
  ) {
    return html`
      <div class="select-wrap">
        <select class="select" @change=${onChange}>
          <option value="" ?selected=${!selected}>Default ${fallback.toLowerCase()}</option>
          ${devices.map(
            (device, index) => html`
              <option value=${device.deviceId} ?selected=${device.deviceId === selected}>
                ${this.deviceLabel(device, fallback, index)}
              </option>
            `,
          )}
        </select>
        <svg
          class="select-arrow"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="m6 9 6 6 6-6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
    `;
  }

  override render() {
    return html`
      <div class="wrapper">
        <h1 class="title">Settings</h1>
        <p class="subtitle">Configure the devices used for voice and video chat.</p>

        ${this.error ? html`<p class="error" role="alert">${this.error}</p>` : null}

        <section class="card">
          <h2>Camera</h2>
          <div class="preview">
            ${
              this.settings.cameraEnabled
                ? html`<video autoplay muted playsinline></video>`
                : html`<div class="preview-off">Camera is off</div>`
            }
          </div>

          <label class="field">
            <span>Camera device</span>
            ${this.renderSelect(this.cameras, this.settings.cameraId, "Camera", this.onCameraChange)}
          </label>

          <label class="switch">
            <input
              type="checkbox"
              .checked=${this.settings.cameraEnabled}
              @change=${this.toggle("cameraEnabled")}
            />
            <span>Enable camera</span>
          </label>
        </section>

        <section class="card">
          <h2>Microphone</h2>

          <label class="field">
            <span>Microphone device</span>
            ${this.renderSelect(
              this.microphones,
              this.settings.microphoneId,
              "Microphone",
              this.onMicChange,
            )}
          </label>

          <div class="field">
            <span>Input level</span>
            <div class="meter" aria-hidden="true">
              <div class="meter-fill" style=${`width: ${Math.round(this.micLevel * 100)}%`}></div>
            </div>
          </div>

          <label class="switch">
            <input
              type="checkbox"
              .checked=${this.settings.micEnabled}
              @change=${this.toggle("micEnabled")}
            />
            <span>Enable microphone</span>
          </label>

          <label class="switch">
            <input
              type="checkbox"
              .checked=${this.settings.noiseSuppression}
              @change=${this.toggle("noiseSuppression")}
            />
            <span>Noise suppression</span>
          </label>

          <label class="switch">
            <input
              type="checkbox"
              .checked=${this.settings.echoCancellation}
              @change=${this.toggle("echoCancellation")}
            />
            <span>Echo cancellation</span>
          </label>

          <label class="switch">
            <input
              type="checkbox"
              .checked=${this.settings.autoGainControl}
              @change=${this.toggle("autoGainControl")}
            />
            <span>Automatic gain control</span>
          </label>
        </section>

        <section class="card">
          <h2>Speaker</h2>
          <label class="field">
            <span>Output device</span>
            ${this.renderSelect(
              this.speakers,
              this.settings.speakerId,
              "Speaker",
              this.onSpeakerChange,
            )}
          </label>
          <ui-button color="secondary" @onClick=${this.testSpeaker}>Test speaker</ui-button>
        </section>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "settings-page": SettingsPage;
  }
}
