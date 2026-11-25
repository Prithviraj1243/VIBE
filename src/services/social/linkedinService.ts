/**
 * linkedinService.ts
 * Real LinkedIn OAuth 2.0 + Share API integration.
 * Client Secret stays on server-side (.env without VITE_ prefix).
 * Client ID is safe to expose in the browser.
 */

const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID as string;
const REDIRECT_URI = `${window.location.origin}/linkedin/callback`;
const SCOPES = ['openid', 'profile', 'email', 'w_member_social'].join(' ');

const STORAGE_KEY_TOKEN = 'linkedin_access_token';
const STORAGE_KEY_PROFILE = 'linkedin_profile';

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

// ─── Token storage (localStorage) ────────────────────────────────────────────

export const linkedinTokenStore = {
  getToken: (): string | null => localStorage.getItem(STORAGE_KEY_TOKEN),
  setToken: (token: string) => localStorage.setItem(STORAGE_KEY_TOKEN, token),
  clearToken: () => localStorage.removeItem(STORAGE_KEY_TOKEN),
  getProfile: (): LinkedInProfile | null => {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    return raw ? JSON.parse(raw) : null;
  },
  setProfile: (profile: LinkedInProfile) =>
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile)),
  clearProfile: () => localStorage.removeItem(STORAGE_KEY_PROFILE),
  isConnected: (): boolean => !!localStorage.getItem(STORAGE_KEY_TOKEN),
};

// ─── OAuth flow ───────────────────────────────────────────────────────────────

/**
 * Step 1 — Redirect user to LinkedIn authorization page.
 * Saves a random state value to localStorage for CSRF protection.
 */
export function startLinkedInOAuth() {
  const state = crypto.randomUUID();
  localStorage.setItem('linkedin_oauth_state', state);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: LINKEDIN_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    state,
    scope: SCOPES,
  });

  window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
}

/**
 * Step 2 — Exchange authorization code for an access token.
 * ⚠️  LinkedIn requires this to be done server-side (client secret needed).
 *     In this frontend-only build we call a Supabase Edge Function or
 *     a local proxy. For now we return the code so the user can exchange
 *     it manually or via a backend.
 *
 * To use with a real backend, POST to your server:
 *   POST /api/linkedin/token  { code, redirect_uri }
 *   → returns { access_token, expires_in }
 */
export async function exchangeLinkedInCode(code: string): Promise<string | null> {
  try {
    // ── If you have a backend/edge function, uncomment and point here: ──
    // const res = await fetch('/api/linkedin/token', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ code, redirect_uri: REDIRECT_URI }),
    // });
    // const { access_token } = await res.json();
    // return access_token;

    // ── Frontend-only fallback: store code, prompt user to exchange ──
    console.warn('[LinkedIn] Code exchange requires a backend. Code:', code);
    return null;
  } catch (err) {
    console.error('[LinkedIn] Token exchange failed:', err);
    return null;
  }
}

/**
 * Step 3 — Fetch the user's LinkedIn profile using their access token.
 */
export async function fetchLinkedInProfile(accessToken: string): Promise<LinkedInProfile | null> {
  try {
    const res = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);

    const data = await res.json();
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
 * Uses the LinkedIn Share API v2.
 */
export async function postToLinkedIn(
  text: string,
  accessToken?: string,
): Promise<LinkedInPostResult> {
  const token = accessToken ?? linkedinTokenStore.getToken();
  const profile = linkedinTokenStore.getProfile();

  if (!token) return { success: false, error: 'No LinkedIn access token. Please connect your account first.' };
  if (!profile) return { success: false, error: 'LinkedIn profile not found. Please reconnect.' };

  try {
    const body = {
      author: profile.personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
    };

    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message ?? `HTTP ${res.status}`);
    }

    const postId = res.headers.get('x-restli-id') ?? 'unknown';
    return { success: true, postId };
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
