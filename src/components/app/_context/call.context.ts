import { createContext } from "@lit/context";

export type CallState = {
  /** Room id of the active call, or null when not in a call. */
  roomId: string | null;
  title: string | null;
  muted: boolean;
  cameraOn: boolean;
  /** Convenience flag — true while a call is active. */
  active: boolean;
  /** Socket ids of members whose mic is currently picking up speech. */
  speaking: string[];
  /** True while the local user is sharing their screen. */
  sharing: boolean;
  /** Live screen-share video streams keyed by the sharer's socket id. */
  screens: { id: string; stream: MediaStream }[];
};

export type StartCallOptions = {
  roomId: string;
  title: string;
  /** Display name announced to the room. */
  name?: string;
  /** Initial mic state for a fresh join (ignored when returning to a call). */
  muted?: boolean;
};

/**
 * The value shared through the call context: the current call state plus the
 * actions that mutate it. The provider owns the WebRTC peers and <audio>
 * elements, so the call keeps working as the user navigates between routes.
 */
export interface CallApi extends CallState {
  start(options: StartCallOptions): Promise<void>;
  leave(): void;
  setMuted(muted: boolean): void;
  toggleScreenShare(): Promise<void>;
}

export const callContext = createContext<CallApi>(Symbol("call-context"));
