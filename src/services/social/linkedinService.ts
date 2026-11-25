/**
 * linkedinService.ts
 * Real LinkedIn OAuth 2.0 + Share API integration.
 * Client Secret stays strictly on the server (.env without VITE_ prefix)
 * and token exchange + API calls are proxied through /api/linkedin/*.
 */

const LINKEDIN_CLIENT_ID = (import.meta.env.VITE_LINKEDIN_CLIENT_ID as string) || '';
const REDIRECT_URI = `${window.location.origin}/linkedin/callback`;
const SCOPES = ['openid', 'profile', 'email', 'w_member_social'].join(' ');

const STORAGE_KEY_TOKEN = 'linkedin_access_token';
const STORAGE_KEY_PROFILE = 'linkedin_profile';
const STORAGE_KEY_STATE = 'linkedin_oauth_state';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LinkedInProfile {
  id: string;
  name: string;
  email: string;
  picture?: string;
  personUrn: string; // e.g. "urn:li:person:ABC123"
}

export interface LinkedInPostResult {
  success: boolean;
  postId?: string;
  error?: string;
}

export interface LinkedInTokenExchangeResult {
  accessToken: string | null;
  error?: string;
}

// ─── Token storage (localStorage) ────────────────────────────────────────────

export const linkedinTokenStore = {
  getToken: (): string | null => localStorage.getItem(STORAGE_KEY_TOKEN),
  setToken: (token: string) => localStorage.setItem(STORAGE_KEY_TOKEN, token),
  clearToken: () => localStorage.removeItem(STORAGE_KEY_TOKEN),
  getProfile: (): LinkedInProfile | null => {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LinkedInProfile;
    } catch {
      return null;
    }
  },
  setProfile: (profile: LinkedInProfile) =>
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile)),
  clearProfile: () => localStorage.removeItem(STORAGE_KEY_PROFILE),
  isConnected: (): boolean => Boolean(localStorage.getItem(STORAGE_KEY_TOKEN)),
};

// ─── OAuth flow ───────────────────────────────────────────────────────────────

/**
 * Step 1 — Redirect user to LinkedIn authorization page.
 * Saves a random state value to both localStorage and sessionStorage for CSRF protection.
 */
export function startLinkedInOAuth() {
  if (!LINKEDIN_CLIENT_ID) {
    throw new Error('VITE_LINKEDIN_CLIENT_ID is missing in .env');
  }

  const state =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`;

  localStorage.setItem(STORAGE_KEY_STATE, state);
  sessionStorage.setItem(STORAGE_KEY_STATE, state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    state,
    scope: SCOPES,
  });

  window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

export function getSavedLinkedInOAuthState(): string | null {
  return sessionStorage.getItem(STORAGE_KEY_STATE) || localStorage.getItem(STORAGE_KEY_STATE);
}

export function clearSavedLinkedInOAuthState() {
  sessionStorage.removeItem(STORAGE_KEY_STATE);
  localStorage.removeItem(STORAGE_KEY_STATE);
}

/**
 * Step 2 — Exchange authorization code for an access token via server-side /api/linkedin/token.
 */
export async function exchangeLinkedInCode(code: string): Promise<LinkedInTokenExchangeResult> {
  try {
    const res = await fetch('/api/linkedin/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri: REDIRECT_URI }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      access_token?: string;
      error?: string;
    };

    if (!res.ok || !data.access_token) {
      return {
        accessToken: null,
        error: data.error || `Token exchange failed (HTTP ${res.status})`,
      };
    }

    return { accessToken: data.access_token };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error during token exchange';
    console.error('[LinkedIn] Token exchange failed:', message);
    return { accessToken: null, error: message };
  }
}

/**
 * Step 3 — Fetch the user's LinkedIn profile using their access token via same-origin proxy.
 */
export async function fetchLinkedInProfile(accessToken: string): Promise<LinkedInProfile | null> {
  try {
    const res = await fetch('/api/linkedin/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);

    const data = (await res.json()) as {
      sub: string;
      name?: string;
      given_name?: string;
      email?: string;
      picture?: string;
    };

    const profile: LinkedInProfile = {
      id: data.sub,
      name: data.name ?? data.given_name ?? 'LinkedIn User',
      email: data.email ?? '',
      picture: data.picture,
      personUrn: `urn:li:person:${data.sub}`,
    };

    linkedinTokenStore.setProfile(profile);
    return profile;
  } catch (err) {
    console.error('[LinkedIn] Failed to fetch profile:', err);
    return null;
  }
}

// ─── Posting ──────────────────────────────────────────────────────────────────

/**
 * Post a text update to LinkedIn on behalf of the authenticated user.
 * Routed through /api/linkedin/post to avoid browser CORS restrictions.
 */
export async function postToLinkedIn(
  text: string,
  accessToken?: string,
): Promise<LinkedInPostResult> {
  const token = accessToken ?? linkedinTokenStore.getToken();
  let profile = linkedinTokenStore.getProfile();

  if (!token) {
    return { success: false, error: 'No LinkedIn access token. Please connect your account first.' };
  }

  if (!profile) {
    profile = await fetchLinkedInProfile(token);
  }

  if (!profile) {
    return { success: false, error: 'LinkedIn profile not found. Please reconnect LinkedIn.' };
  }

  try {
    const res = await fetch('/api/linkedin/post', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        personUrn: profile.personUrn,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      postId?: string;
      error?: string;
    };

    if (!res.ok || !data.success) {
      throw new Error(data.error ?? `HTTP ${res.status}`);
    }

    return { success: true, postId: data.postId ?? 'published' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[LinkedIn] Post failed:', message);
    return { success: false, error: message };
  }
}

/**
 * Disconnect: clear stored token and profile.
 */
export function disconnectLinkedIn() {
  linkedinTokenStore.clearToken();
  linkedinTokenStore.clearProfile();
}
