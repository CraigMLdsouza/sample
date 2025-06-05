import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@server/trpc/router';
import { createContext } from '@server/trpc/context';
import { NextRequest } from 'next/server';

// Custom replacer function to handle circular references
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

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => createContext({ req }),
    responseMeta() {
      return {
        headers: {
          'Content-Type': 'application/json',
        },
      };
    },
    onError({ error }) {
      console.error('tRPC error:', error);
    },
  });

export { handler as GET, handler as POST }; 