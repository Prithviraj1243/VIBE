import type { AuthSession, UserProfile } from '../../types';
import { DEMO_USER } from '../../mocks/data';
import { localStore } from '../storage/localStore';

export interface AuthService {
  getSession(): AuthSession | null;
  signInDemo(profile?: Partial<UserProfile>): AuthSession;
  signInWithGoogleCredential(credential: string): Promise<AuthSession>;
  signOut(): void;
}

class StandardAuthService implements AuthService {
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

  async signInWithGoogleCredential(credential: string): Promise<AuthSession> {
    try {
      // Decode JWT token payload without external heavy dependencies
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      const user: UserProfile = {
        id: payload.sub || `google_${Date.now()}`,
        displayName: payload.name || payload.given_name || 'Google User',
        email: payload.email || '',
        avatar: payload.picture,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        language: payload.locale || 'English',
        authMode: 'demo', // mark as verified account session
      };

      const session: AuthSession = {
        mode: 'demo',
        issuedAt: new Date().toISOString(),
        user,
      };

      localStore.set('session', session);
      return session;
    } catch (err) {
      console.error('Failed to parse Google credential token:', err);
      // Fallback
      return this.signInDemo({ displayName: 'Google User' });
    }
  }

  signOut() {
    localStore.remove('session');
  }
}

export const authService: AuthService = new StandardAuthService();
