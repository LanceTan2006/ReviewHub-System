import { createClient } from '@supabase/supabase-js';

const env = typeof import.meta !== 'undefined' && import.meta.env
  ? import.meta.env
  : (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};

const supabaseUrl = (env as Record<string, string | undefined>).VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = (env as Record<string, string | undefined>).VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);
