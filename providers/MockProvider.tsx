"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Initializes Mock Service Worker before rendering children. Without this
 * gate, components could fire requests at /api/* before the worker has
 * registered → fall-through to the real network and 404.
 *
 * This app has no real backend, so MSW runs in production too. The
 * NEXT_PUBLIC_MOCK_API env var is the kill-switch: set it to "false" once
 * a real API is wired up. Anything else (or unset) keeps MSW on.
 */
export function MockProvider({ children }: { children: ReactNode }) {
  const enabled = process.env.NEXT_PUBLIC_MOCK_API !== "false";

  const [ready, setReady] = useState(!enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    (async () => {
      try {
        const { startMockWorker } = await import("@/mocks/browser");
        await startMockWorker();
        if (!cancelled) setReady(true);
      } catch (e) {
        // Don't trap the UI on init failure — render the app so the user can
        // at least see what's broken, and surface the reason loudly.
        // eslint-disable-next-line no-console
        console.error("[MSW] failed to start", e);
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!ready) {
    // Tiny full-screen loader. Better than flashing un-mocked content.
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm">Initializing…</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {error ? (
        <div className="fixed inset-x-0 top-0 z-100 bg-destructive px-4 py-2 text-center text-xs text-destructive-foreground">
          Mock API failed to start: {error}. Open DevTools → Application → Service Workers for details.
        </div>
      ) : null}
      {children}
    </>
  );
}
