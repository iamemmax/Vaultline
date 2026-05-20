"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Initializes Mock Service Worker before rendering children. Without this
 * gate, components could fire requests at /api/* before the worker has
 * registered → fall-through to the real network and 404.
 *
 * In production builds we skip MSW entirely. Setting
 * NEXT_PUBLIC_MOCK_API=false also disables it for testing real APIs in dev.
 */
export function MockProvider({ children }: { children: ReactNode }) {
  const enabled =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_MOCK_API !== "false";

  const [ready, setReady] = useState(!enabled);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    (async () => {
      const { startMockWorker } = await import("@/mocks/browser");
      await startMockWorker();
      if (!cancelled) setReady(true);
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

  return <>{children}</>;
}
