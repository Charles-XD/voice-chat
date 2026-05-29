import { createContext } from "@lit/context";
import type { RoomMember } from "../../../api";

export type RoomState = {
  name: string;
  title?: string;
  isPublic?: boolean;
  creatorId?: string;
  allowed?: string[];
  /** Members connected to the room at join time (seed for the live list). */
  users?: RoomMember[];
};

export const roomContext = createContext<RoomState>("room-context");
