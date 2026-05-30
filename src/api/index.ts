// Same-origin by default: the Vite dev server proxies `/api` to the backend
// (and the production build is served by the backend itself), so relative URLs
// work everywhere without mixed-content/CORS issues. Override with
// VITE_API_SERVER to point at an explicit backend.
export const API_BASE_URL = import.meta.env.VITE_API_SERVER || "";

export interface UserResponse {
  name: string | null;
}

export async function getUser(key: string, signal?: AbortSignal): Promise<UserResponse> {
  const response = await fetch(`${API_BASE_URL}/api?key=${encodeURIComponent(key)}`, { signal });

  if (!response.ok) throw new Error("Session expired");

  return (await response.json()) as UserResponse;
}

export async function updateUserName(key: string, name: string): Promise<UserResponse> {
  const response = await fetch(`${API_BASE_URL}/api/name`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, name }),
  });

  if (!response.ok) throw new Error("Failed to update name");

  return (await response.json()) as UserResponse;
}

export interface RoomMember {
  /** Socket id (stable per connection). */
  id: string;
  /** Display name shown in the UI. */
  name: string;
  muted: boolean;
  sharing?: boolean;
  cameraOn?: boolean;
}

export interface Room {
  id: string;
  name: string;
  isPublic: boolean;
  creatorId: string;
  allowed: string[];
  createdAt: number;
  /** Members currently connected to the room (live membership). */
  users?: RoomMember[];
}

export interface RoomAccess {
  allowed: boolean;
  room?: Room;
}

export async function createRoom(key: string, title: string, isPublic = false): Promise<Room> {
  const response = await fetch(`${API_BASE_URL}/api/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, title, isPublic }),
  });

  if (!response.ok) throw new Error("Failed to create room");

  return (await response.json()) as Room;
}

export async function getRoom(roomId: string, signal?: AbortSignal): Promise<Room | null> {
  const response = await fetch(`${API_BASE_URL}/api/rooms/${encodeURIComponent(roomId)}`, {
    signal,
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Failed to load room");

  return (await response.json()) as Room;
}

export async function canJoinRoom(
  roomId: string,
  key?: string,
  signal?: AbortSignal,
): Promise<RoomAccess> {
  const query = key ? `?key=${encodeURIComponent(key)}` : "";
  const response = await fetch(
    `${API_BASE_URL}/api/rooms/${encodeURIComponent(roomId)}/can-join${query}`,
    { signal },
  );

  if (!response.ok) return { allowed: false };

  return (await response.json()) as RoomAccess;
}

export async function allowUser(roomId: string, key: string, userId: string): Promise<Room> {
  const response = await fetch(`${API_BASE_URL}/api/rooms/${encodeURIComponent(roomId)}/allow`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, userId }),
  });

  if (!response.ok) throw new Error("Failed to allow user");

  return (await response.json()) as Room;
}
