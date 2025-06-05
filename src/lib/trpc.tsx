"use client";
// This file is used to set up the tRPC client and provider for React Query in a Next.js application.
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../server/trpc/router';
import { httpBatchLink } from '@trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';

export const trpc = createTRPCReact<AppRouter>();

// Custom replacer function to handle circular references
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function safeStringify(obj: any) {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        // Circular reference found, return a placeholder
        return '[Circular]';
      }
      cache.add(value);
    }
    return value;
  });
}

export function getTrpcClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: '/api/trpc',
        transformer: {
          serialize: (data) => safeStringify(data),
          deserialize: (data) => JSON.parse(data),
        },
      }),
    ],
  });
}

// Correct JSX usage for trpc.Provider
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());
  const trpcClient = React.useMemo(() => getTrpcClient(), []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}