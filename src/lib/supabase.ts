import { createClient } from '@supabase/supabase-js';
import { auth } from './firebase';

const env = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env
  : (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

const supabaseUrl = (env as Record<string, string | undefined>).VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = (env as Record<string, string | undefined>).VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      accessToken: async () => {
        const user = auth.currentUser;
        if (!user) return null;
        return user.getIdToken(true);
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export async function getSupabaseClientForFirebaseUser(firebaseUser = auth.currentUser) {
  if (!supabaseUrl || !supabaseAnonKey || !firebaseUser) {
    return supabase;
  }

  const accessToken = await firebaseUser.getIdToken(true);

  return createClient(supabaseUrl, supabaseAnonKey, {
    accessToken: async () => accessToken,
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function getFirebaseAuthRoleClaim() {
  const user = auth.currentUser;
  if (!user) return null;

  const token = await user.getIdTokenResult(true);
  return token.claims.role ?? null;
}

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);
