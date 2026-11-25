/**
 * LinkedInCallback.tsx
 * Handles the OAuth redirect from LinkedIn at /linkedin/callback.
 * Exchanges ?code=XXX for an access token via our server-side /api/linkedin/token endpoint,
 * fetches the user's profile, and redirects back to /integrations.
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Linkedin, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import {
  clearSavedLinkedInOAuthState,
  exchangeLinkedInCode,
  fetchLinkedInProfile,
  getSavedLinkedInOAuthState,
  linkedinTokenStore,
} from '../../services/social/linkedinService';

export function LinkedInCallback() {
  const navigate = useNavigate();
  const hasRunRef = useRef(false);
  const [status, setStatus] = useState<'loading' | 'success' | 'manual' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [profileName, setProfileName] = useState('');
  const [manualToken, setManualToken] = useState('');

  useEffect(() => {
    // Guard against React 18 StrictMode double-invocation (auth codes are single-use)
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    const savedState = getSavedLinkedInOAuthState();

    if (error) {
      clearSavedLinkedInOAuthState();
      setStatus('error');
      setMessage(errorDescription || `LinkedIn denied access (${error}).`);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('Missing authorization code from LinkedIn. Please start from Integrations.');
      return;
    }

    if (!savedState || state !== savedState) {
      clearSavedLinkedInOAuthState();
      setStatus('error');
      setMessage('OAuth state verification failed. Please go back and click "Connect LinkedIn" again.');
      return;
    }

    clearSavedLinkedInOAuthState();

    exchangeLinkedInCode(code).then(async (result) => {
      if (result.accessToken) {
        linkedinTokenStore.setToken(result.accessToken);
        const profile = await fetchLinkedInProfile(result.accessToken);
        if (profile) {
          setProfileName(profile.name);
        }
        setStatus('success');
        setTimeout(() => navigate('/integrations', { replace: true }), 1400);
      } else {
        setStatus('manual');
        setMessage(result.error || 'Automatic token exchange failed.');
      }
    });
  }, [navigate]);

  const handleSaveToken = async () => {
    const trimmed = manualToken.trim();
    if (!trimmed) return;
    linkedinTokenStore.setToken(trimmed);
    const profile = await fetchLinkedInProfile(trimmed);
    if (profile) {
      setProfileName(profile.name);
      setStatus('success');
      setTimeout(() => navigate('/integrations', { replace: true }), 1400);
    } else {
      linkedinTokenStore.clearToken();
      setStatus('error');
      setMessage('Token invalid, expired, or missing openid/profile scope. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#181818] border border-[#2e2e2e] rounded-2xl p-8 text-center space-y-5">
        <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto">
          <Linkedin size={28} className="text-blue-400" />
        </div>

        {status === 'loading' && (
          <>
            <Loader2 size={24} className="animate-spin text-blue-400 mx-auto" />
            <p className="text-white font-semibold">Connecting LinkedIn…</p>
            <p className="text-neutral-400 text-xs">Exchanging authorization code for your access token</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={32} className="text-emerald-400 mx-auto" />
            <p className="text-white font-bold text-lg">
              {profileName ? `Connected as ${profileName}` : 'LinkedIn Connected!'}
            </p>
            <p className="text-neutral-400 text-sm">Redirecting you back to Integrations…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={32} className="text-red-400 mx-auto" />
            <p className="text-white font-bold">Connection Failed</p>
            <p className="text-neutral-400 text-sm break-words">{message}</p>
            <button
              onClick={() => navigate('/integrations', { replace: true })}
              className="mt-4 px-6 py-2.5 bg-[#F28C45] hover:bg-[#e07b34] text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Back to Integrations
            </button>
          </>
        )}

        {status === 'manual' && (
          <>
            <p className="text-white font-bold">Automatic Exchange Unavailable</p>
            <p className="text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5 text-left">
              {message}
            </p>
            <p className="text-neutral-400 text-xs text-left">
              If you have a LinkedIn Access Token, paste it below, or go back and reconnect.
            </p>
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Paste LinkedIn access token here…"
              className="w-full px-4 py-3 rounded-xl bg-[#111] border border-[#333] text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/integrations', { replace: true })}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-sm font-semibold transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSaveToken}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Save & Connect
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
