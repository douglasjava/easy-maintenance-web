"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Create the QueryClient once per app load
  const [queryClient] = useState(() => new QueryClient());

  // Load Bootstrap JS only on client
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
