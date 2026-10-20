import type { AuthSession, UserProfile } from '../../types';
import { DEMO_USER } from '../../mocks/data';
import { localStore } from '../storage/localStore';

export interface AuthService {
  getSession(): AuthSession | null;
  signInDemo(profile?: Partial<UserProfile>): AuthSession;
  signOut(): void;
  /** Reserved for Firebase / OAuth. Not implemented in this frontend-first build. */
  signInWithGoogle(): Promise<never>;
}

class DemoAuthService implements AuthService {
  getSession(): AuthSession | null {
    return localStore.get<AuthSession | null>('session', null);
  }

  signInDemo(profile?: Partial<UserProfile>): AuthSession {
    const session: AuthSession = {
      mode: 'demo',
      issuedAt: new Date().toISOString(),
      user: { ...DEMO_USER, ...profile, authMode: 'demo' },
    };
    localStore.set('session', session);
    return session;
  }

  signOut() {
    localStore.remove('session');
  }

  async signInWithGoogle(): Promise<never> {
    throw new Error('Google authentication is not connected. Use demo mode.');
  }
}

export const authService: AuthService = new DemoAuthService();
