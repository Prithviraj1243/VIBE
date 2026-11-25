/**
 * LinkedInCallback.tsx
 * Handles the OAuth redirect from LinkedIn.
 * Route: /linkedin/callback
 *
 * LinkedIn sends: ?code=XXX&state=YYY
 * We validate state, store the token (or show manual instructions),
 * then navigate back to the integrations page.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Linkedin, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import {
  exchangeLinkedInCode,
  fetchLinkedInProfile,
  linkedinTokenStore,
} from '../../services/social/linkedinService';

export function LinkedInCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'manual' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [authCode, setAuthCode] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const savedState = localStorage.getItem('linkedin_oauth_state');

    if (error) {
      setStatus('error');
      setMessage(`LinkedIn denied access: ${error}`);
      return;
    }

    if (!code || state !== savedState) {
      setStatus('error');
      setMessage('Invalid OAuth state. Please try connecting again.');
      return;
    }

    localStorage.removeItem('linkedin_oauth_state');

    // Try server-side exchange first
    exchangeLinkedInCode(code).then(async (token) => {
      if (token) {
        linkedinTokenStore.setToken(token);
        await fetchLinkedInProfile(token);
        setStatus('success');
        setTimeout(() => navigate('/'), 2000);
      } else {
        // No backend yet — show manual token entry
        setAuthCode(code);
        setStatus('manual');
        setMessage(code);
      }
    });
  }, [navigate]);

  // Manual token paste handler (when no backend)
  const [manualToken, setManualToken] = useState('');
  const handleSaveToken = async () => {
    if (!manualToken.trim()) return;
    linkedinTokenStore.setToken(manualToken.trim());
    const profile = await fetchLinkedInProfile(manualToken.trim());
    if (profile) {
      setStatus('success');
      setTimeout(() => navigate('/'), 1500);
    } else {
      setStatus('error');
      setMessage('Token invalid or expired. Please try again.');
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
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={32} className="text-emerald-400 mx-auto" />
            <p className="text-white font-bold text-lg">LinkedIn Connected! ✅</p>
            <p className="text-neutral-400 text-sm">Redirecting you back to VYBE…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={32} className="text-red-400 mx-auto" />
            <p className="text-white font-bold">Connection Failed</p>
            <p className="text-neutral-400 text-sm">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2 bg-[#F28C45] text-white rounded-xl text-sm font-semibold"
            >
              Back to VYBE
            </button>
          </>
        )}

        {status === 'manual' && (
          <>
            <p className="text-white font-bold">One More Step</p>
            <p className="text-neutral-400 text-sm text-left">
              Paste your LinkedIn <strong>Access Token</strong> below.
              Get it from:{' '}
              <a
                href="https://www.linkedin.com/developers/tools/oauth/token-generator"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 underline"
              >
                LinkedIn Token Generator →
              </a>
            </p>
            <div className="mt-2 p-3 bg-[#111] rounded-xl border border-[#333] text-left">
              <p className="text-[11px] text-neutral-500 mb-1">Your auth code (for reference):</p>
              <p className="text-[11px] text-neutral-300 break-all font-mono">{authCode}</p>
            </div>
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Paste access token here…"
              className="w-full mt-2 px-4 py-3 rounded-xl bg-[#111] border border-[#333] text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSaveToken}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Save & Connect
            </button>
          </>
        )}
      </div>
    </div>
  );
}
