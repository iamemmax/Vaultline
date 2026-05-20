import { setupWorker } from "msw/browser";

import { handlers } from "@/mocks/handlers";

/**
 * Browser-side MSW. Lazy-loaded by MockProvider so the worker code never
 * ships in production builds.
 */

let started = false;

export async function startMockWorker(): Promise<void> {
  if (typeof window === "undefined" || started) return;
  const worker = setupWorker(...handlers);
  await worker.start({
    onUnhandledRequest: "bypass",
    serviceWorker: {
      url: "/mockServiceWorker.js",
    },
  });
  started = true;
  // eslint-disable-next-line no-console
  console.info("✅ Mock Service Worker started");
}
