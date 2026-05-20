"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Used to register a Service Worker for MSW. We no longer need that —
 * `lib/api/client.ts` dispatches requests in-process against the MSW
 * handlers — so this provider is a no-op kept only to (a) preserve the
 * import sites in `app/layout.tsx`, and (b) eagerly unregister any
 * leftover MSW Service Worker from a previous deploy so it doesn't keep
 * intercepting (and corrupting) requests.
 */
export function MockProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => {
        for (const reg of regs) {
          const url = reg.active?.scriptURL ?? "";
          if (url.includes("mockServiceWorker")) {
            // eslint-disable-next-line no-console
            console.info("[mock] unregistering stale MSW service worker");
            reg.unregister();
          }
        }
      })
      .catch(() => {
        // best-effort; ignore
      });
  }, []);

  return <>{children}</>;
}
