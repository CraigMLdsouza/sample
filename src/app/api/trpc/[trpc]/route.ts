import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@server/trpc/router';
import { createContext } from '@server/trpc/context';
import { NextRequest } from 'next/server';

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