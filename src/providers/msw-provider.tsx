"use client";

import { useEffect, useState } from "react";

export function MswProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    async function enableMocking() {
      if (typeof window !== "undefined") {
        const { worker } = await import("@/mocks/browser");
        // `worker.start()` returns a Promise that resolves
        // once the Service Worker is up and ready to intercept requests.
        await worker.start({
          onUnhandledRequest: "bypass",
        });
        setMswReady(true);
      }
    }

    enableMocking();
  }, []);

  if (!mswReady) {
    // Return null or a loading spinner while MSW mounts
    // so we don't accidentally send a real request on first render
    return null;
  }

  return <>{children}</>;
}
