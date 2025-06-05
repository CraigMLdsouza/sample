import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../src/lib/supabase';
import { auth0 } from '@/lib/auth0';
import type { NextRequest } from 'next/server';

class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function createContext(_opts: { req: NextRequest }) {
  try {
    // Get the session
    const session = await auth0.getSession();
    console.log('Session:', session);

    let userUuid = null;
    let accessToken = null;

    // Use user's ID token for RLS (must be a JWT)
    const idToken = typeof session?.tokenSet?.idToken === 'string' ? session.tokenSet.idToken : undefined;
    console.log('idToken:', idToken);

    if (idToken) {
      // Debug: print JWT payload
      try {
        const base64Payload = idToken.split('.')[1];
        // Pad base64 if needed
        const padded = base64Payload.padEnd(base64Payload.length + (4 - base64Payload.length % 4) % 4, '=');
        const payload = JSON.parse(Buffer.from(padded, 'base64').toString());
        console.log('Auth0 ID Token payload:', JSON.stringify(payload, null, 2));
      } catch (e) {
        console.warn('Could not parse ID token payload:', e);
      }
    }

    const supabaseClient = idToken
      ? createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_ANON_KEY!,
          {
            global: { headers: { Authorization: `Bearer ${idToken}` } },
          }
        )
      : supabase;

    // Upsert user in Supabase if authenticated
    if (session?.user) {
      const { email, sub } = session.user;

      if (!sub) throw new AuthError('Missing user ID in session');

      const { data: user, error: upsertError } = await supabaseClient
        .from('app_users')
        .upsert(
          { auth0_id: sub, email },
          { onConflict: 'auth0_id' }
        )
        .select('id')
        .single();

      console.log('Upsert result:', { user, upsertError });

      if (upsertError) throw new AuthError(`Failed to upsert user: ${upsertError.message}`);
      if (!user?.id) throw new AuthError('No user ID returned from upsert');

      userUuid = user.id;
      accessToken = idToken;
    }

    return { supabase: supabaseClient, session, userUuid, accessToken };
  } catch (error) {
    console.error('[Context Error]:', error);
    throw error;
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>;