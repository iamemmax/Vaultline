"use client";

import { useEffect } from "react";

import { clearAuthToken, getAuthToken } from "@/lib/api/client";
import { clearSessionMeta } from "@/lib/auth/session";

/**
 * If a user lands on an auth page with stale auth cookies (token cookie set
 * but no matching localStorage entry — usually from a schema/seed reset that
 * wiped localStorage), clear them so middleware doesn't bounce future
 * navigations back to a dashboard the user can't actually open.
 */
export function AuthStaleStateGuard() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const lsToken = getAuthToken();
    const hasCookie = document.cookie.includes("ft.token=");
    if (!lsToken && hasCookie) {
      clearAuthToken();
      clearSessionMeta();
    }
  }, []);

  return null;
}
