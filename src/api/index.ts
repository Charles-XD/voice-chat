export const API_BASE_URL = "http://localhost:4000";

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

export async function canJoinRoom(roomId: string, signal?: AbortSignal): Promise<boolean> {
  const response = await fetch(
    `${API_BASE_URL}/api/rooms/${encodeURIComponent(roomId)}/can-join`,
    { signal },
  );

  if (!response.ok) return false;

  const data = (await response.json()) as { allowed?: boolean };
  return Boolean(data.allowed);
}
