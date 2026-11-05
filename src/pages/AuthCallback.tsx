/**
 * AuthCallback — Handles the OAuth redirect from Google sign-in.
 *
 * Supabase can return auth data in two ways depending on flow:
 *   PKCE flow:     /auth/callback?code=ABC123         ← preferred, secure
 *   Implicit flow: /auth/callback#access_token=...    ← fallback
 *
 * This component handles both, plus listens for the auth state change
 * event that Supabase fires when it auto-detects a session in the URL.
 */
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { hydrateSupabaseSession } from '../lib/hybridAuth';
import { AuthUser } from '../rbac';
import logoImg from '../assets/images/reviewhub_logo.png';

interface AuthCallbackProps {
  onLoginSuccess: (user: AuthUser) => void;
  onNavigate: (page: 'landing') => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({
  onLoginSuccess,
  onNavigate,
}) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function finishLogin() {
      try {
        const user = await hydrateSupabaseSession();
        if (!isMounted) return;
        if (user) {
          window.history.replaceState({}, '', '/');
          onLoginSuccess(user);
        } else {
          setError('Could not load your profile. Please try signing in again.');
        }
      } catch (err: any) {
        if (isMounted) setError(err?.message ?? 'Authentication failed. Please try again.');
      }
    }

    // ── Path 1: PKCE flow — ?code= in query string ──────────
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');

    if (code) {
      supabase!.auth.exchangeCodeForSession(code).then(({ error: exchangeErr }) => {
        if (exchangeErr) {
          if (isMounted) setError(exchangeErr.message);
          return;
        }
        finishLogin();
      });
      return () => { isMounted = false; };
    }

    // ── Path 2: Implicit flow — #access_token= in hash ──────
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      // Supabase client auto-detects and sets the session from the hash.
      // Just wait for the SIGNED_IN event via onAuthStateChange.
      const { data: { subscription } } = supabase!.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN') {
          subscription.unsubscribe();
          finishLogin();
        }
      });
      return () => { isMounted = false; subscription.unsubscribe(); };
    }

    // ── Path 3: Session already exists (page refresh) ────────
    // detectSessionInUrl: true in the client may have already set it.
    finishLogin();

    return () => { isMounted = false; };
  }, [onLoginSuccess]);

  return (
    <div className="min-h-screen bg-[#F4FAFD] flex flex-col items-center justify-center gap-6 px-4">
      <img src={logoImg} alt="ReviewHub" className="h-12 w-auto" />

      {error ? (
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto">
            <i className="bi bi-x-circle text-3xl text-red-400" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-extrabold text-[#2C3E50]">Sign-in Failed</h1>
          <p className="text-sm text-[#64748B]">{error}</p>
          <button
            onClick={() => onNavigate('landing')}
            className="px-6 py-2.5 rounded-xl bg-[#3498DB] text-white text-sm font-bold hover:bg-[#2980B9] transition-colors cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#3498DB] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#64748B]">Completing sign-in…</p>
        </div>
      )}
    </div>
  );
};
