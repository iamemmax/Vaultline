import { getAuthToken } from "@/lib/api/client";

/**
 * Lightweight session helpers. The full user record lives in React Query
 * under queryKeys.auth.me; these are for synchronous role/auth checks
 * (e.g. in nav guards) where awaiting a fetch is overkill.
 */

const ROLE_COOKIE = "ft.role";
const USER_ID_COOKIE = "ft.uid";

export function setSessionMeta(opts: { userId: string; role: "USER" | "ADMIN" }) {
  if (typeof document === "undefined") return;
  document.cookie = `${ROLE_COOKIE}=${opts.role}; path=/; max-age=86400; SameSite=Lax`;
  document.cookie = `${USER_ID_COOKIE}=${opts.userId}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearSessionMeta() {
  if (typeof document === "undefined") return;
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${USER_ID_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? (match.split("=")[1] ?? null) : null;
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function getRole(): "USER" | "ADMIN" | null {
  const r = readCookie(ROLE_COOKIE);
  return r === "USER" || r === "ADMIN" ? r : null;
}
