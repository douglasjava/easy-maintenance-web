"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Create the QueryClient once per app load with global performance defaults.
  // - staleTime: 2 min → avoids redundant refetches on navigation
  // - refetchOnWindowFocus: false → tab switches don't trigger background refetches
  // - retry: 1 → fail fast on errors instead of 3 silent retries
  // Queries that need fresher data (e.g. notifications) should override staleTime locally.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 2,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  // Load Bootstrap JS only on client
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
