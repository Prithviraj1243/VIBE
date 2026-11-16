/**
 * supabaseAuthService.ts
 * Wraps Supabase Auth so the rest of the app keeps the same AuthService interface.
 * Falls back gracefully when Supabase is unreachable.
 */
import { supabase } from './client';
import type { AuthSession, UserProfile } from '../../types';
import { DEMO_USER } from '../../mocks/data';
import { localStore } from '../storage/localStore';

// ─── helpers ─────────────────────────────────────────────────────────────────

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      ),
    );
  } catch {
    return {};
  }
}

function sbUserToProfile(user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }): UserProfile {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    displayName: (meta.full_name as string) || (meta.name as string) || user.email?.split('@')[0] || 'User',
    email: user.email ?? '',
    avatar: (meta.avatar_url as string) || (meta.picture as string) || undefined,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    language: 'English',
    authMode: 'google',
  };
}

function localSession(user: UserProfile): AuthSession {
  return { mode: 'google', issuedAt: new Date().toISOString(), user };
}

// ─── service ─────────────────────────────────────────────────────────────────

export const supabaseAuthService = {
  /** Return cached session from Supabase or localStore fallback */
  async getSession(): Promise<AuthSession | null> {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const profile = sbUserToProfile(data.session.user);
        return localSession(profile);
      }
    } catch (err) {
      console.warn('[SupabaseAuth] getSession failed, falling back to localStore:', err);
    }
    return localStore.get<AuthSession | null>('session', null);
  },

  /** Sign in via Google using an ID-token credential issued by @react-oauth/google */
  async signInWithGoogleIdToken(credential: string): Promise<AuthSession> {
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credential,
      });

      if (error) throw error;

      if (data.user) {
        const profile = sbUserToProfile(data.user);
        const session = localSession(profile);
        localStore.set('session', session);
        return session;
      }
    } catch (err) {
      console.warn('[SupabaseAuth] signInWithIdToken failed, falling back to JWT decode:', err);
    }

    // ── Fallback: decode the JWT locally (keeps Google name/avatar working) ──
    const payload = decodeJwtPayload(credential);
    const user: UserProfile = {
      id: (payload.sub as string) || `google_${Date.now()}`,
      displayName: (payload.name as string) || (payload.given_name as string) || 'Google User',
      email: (payload.email as string) || '',
      avatar: payload.picture as string | undefined,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      language: (payload.locale as string) || 'English',
      authMode: 'google',
    };
    const session = localSession(user);
    localStore.set('session', session);
    return session;
  },

  /** Demo sign-in (no Supabase) */
  signInDemo(profile?: Partial<UserProfile>): AuthSession {
    const session: AuthSession = {
      mode: 'demo',
      issuedAt: new Date().toISOString(),
      user: { ...DEMO_USER, ...profile, authMode: 'demo' },
    };
    localStore.set('session', session);
    return session;
  },

  /** Sign out of Supabase AND clear localStore */
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[SupabaseAuth] signOut error:', err);
    }
    localStore.remove('session');
  },

  /** Subscribe to Supabase auth state changes */
  onAuthChange(callback: (profile: UserProfile | null) => void) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback(sbUserToProfile(session.user));
      } else {
        callback(null);
      }
    });
    return data.subscription;
  },
};
