import { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { supabase } from '../../lib/supabase';
import { getServerSession } from '../../lib/auth0';

export async function createContext(opts: CreateNextContextOptions) {
  // Extract Auth0 session from request (SSR)
  const req = opts.req;
  const res = opts.res;
  const session = await getServerSession(req, res);

  // Upsert user in Supabase if authenticated
  if (session?.user) {
    const { sub, email } = session.user;
    if (sub) {
      await supabase.from('users').upsert({ auth0_id: sub, email });
    }
  }

  return {
    supabase,
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>; 