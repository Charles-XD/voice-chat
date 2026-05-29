export interface AppSettings {
  /** Selected camera (video input) device id. */
  cameraId?: string;
  /** Selected microphone (audio input) device id. */
  microphoneId?: string;
  /** Selected speaker (audio output) device id. */
  speakerId?: string;

  /** Whether the camera is enabled by default when joining a room. */
  cameraEnabled: boolean;
  /** Whether the microphone is enabled by default when joining a room. */
  micEnabled: boolean;

  /** Audio processing constraints applied to the microphone stream. */
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  cameraId: undefined,
  microphoneId: undefined,
  speakerId: undefined,
  cameraEnabled: true,
  micEnabled: true,
  noiseSuppression: true,
  echoCancellation: true,
  autoGainControl: true,
};
