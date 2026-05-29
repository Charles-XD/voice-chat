import type { User } from "../interfaces/user.interface";

export const isAuthenticated = (user?: User | null): boolean => Boolean(user);

export const isGuest = (user?: User | null): boolean => Boolean(user?.isGuest);

export const hasKey = (user?: User | null): boolean => Boolean(user?.key) && !user?.isGuest;

export const canUseKeyFeatures = (user?: User | null): boolean => hasKey(user);
