import { createContext } from "@lit/context";

export type RoomState = {
  name: string;
};

export const roomContext = createContext<RoomState>("room-context");
