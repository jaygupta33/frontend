"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// This provider component wraps our app and provides the QueryClient
export default function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // We use useState to ensure the QueryClient is only created once
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
