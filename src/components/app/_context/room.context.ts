import { createContext } from "@lit/context";

export type RoomState = {
  name: string;
  title?: string;
  isPublic?: boolean;
  creatorId?: string;
  allowed?: string[];
};

export const roomContext = createContext<RoomState>("room-context");
