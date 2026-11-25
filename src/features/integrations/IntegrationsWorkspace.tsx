import React, { useEffect, useState } from 'react';
import { Instagram, Linkedin, ShieldCheck, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import {
  startLinkedInOAuth,
  disconnectLinkedIn,
  linkedinTokenStore,
  fetchLinkedInProfile,
  type LinkedInProfile,
} from '../../services/social/linkedinService';

export const IntegrationsWorkspace: React.FC = () => {
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInProfile | null>(null);
  const [linkedInConnected, setLinkedInConnected] = useState(false);

  // Load saved LinkedIn connection on mount
  useEffect(() => {
    const token = linkedinTokenStore.getToken();
    const profile = linkedinTokenStore.getProfile();
    if (token && profile) {
      setLinkedInConnected(true);
      setLinkedInProfile(profile);
    } else if (token && !profile) {
      // Token exists but profile missing — refetch
      fetchLinkedInProfile(token).then((p) => {
        if (p) {
          setLinkedInProfile(p);
          setLinkedInConnected(true);
        }
      });
    }
  }, []);

  const handleLinkedInConnect = () => {
    startLinkedInOAuth(); // Redirects to LinkedIn
  };

  const handleLinkedInDisconnect = () => {
    disconnectLinkedIn();
    setLinkedInConnected(false);
    setLinkedInProfile(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#262626]">
        <h1 className="text-2xl font-bold text-white">Social Platform Integrations</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Connect official APIs for real posting. No passwords stored — OAuth only.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── LinkedIn Card ─────────────────────────────────────────────── */}
        <div className="p-6 rounded-2xl bg-[#181818] border border-[#2e2e2e] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-400">
                  <Linkedin size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">LinkedIn</h3>
                  <p className="text-xs text-neutral-400">
                    {linkedInProfile ? linkedInProfile.name : 'Not connected'}
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                linkedInConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-neutral-800 text-neutral-400'
              }`}>
                {linkedInConnected
                  ? <><CheckCircle size={11} /> Connected</>
                  : <><XCircle size={11} /> Disconnected</>}
              </span>
            </div>

            {linkedInProfile && (
              <div className="mt-4 p-3 rounded-xl bg-[#111] border border-[#222] flex items-center gap-3">
                {linkedInProfile.picture && (
                  <img
                    src={linkedInProfile.picture}
                    alt={linkedInProfile.name}
                    className="w-9 h-9 rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-white">{linkedInProfile.name}</p>
                  <p className="text-[11px] text-neutral-400">{linkedInProfile.email}</p>
                </div>
              </div>
            )}

            <div className="mt-4 p-3 rounded-xl bg-[#121212] border border-[#222222] text-xs text-neutral-300 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" /> Scopes Requested:
              </div>
              <p className="text-[11px] text-neutral-400">
                openid · profile · email · w_member_social
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-3">
            <span className="text-[11px] text-neutral-500">
              {linkedInConnected ? '✅ Ready to post' : 'OAuth 2.0 · Official API'}
            </span>
            <div className="flex gap-2">
              {linkedInConnected && (
                <a
                  href="https://www.linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1 transition-colors"
                >
                  <ExternalLink size={12} /> View
                </a>
              )}
              <button
                type="button"
                onClick={linkedInConnected ? handleLinkedInDisconnect : handleLinkedInConnect}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  linkedInConnected
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {linkedInConnected ? 'Disconnect' : 'Connect LinkedIn'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Instagram Card ────────────────────────────────────────────── */}
        <div className="p-6 rounded-2xl bg-[#181818] border border-[#2e2e2e] space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-pink-500/10 text-pink-400">
                  <Instagram size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Instagram</h3>
                  <p className="text-xs text-neutral-400">Not connected</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-neutral-800 text-neutral-400 flex items-center gap-1">
                <XCircle size={11} /> Disconnected
              </span>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[#121212] border border-[#222222] text-xs text-neutral-300 space-y-1">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-neutral-500" /> Requires:
              </div>
              <p className="text-[11px] text-neutral-400">
                instagram_basic · instagram_content_publish · Meta Business App
              </p>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-400">
              Requires a Meta Developer App with Instagram Graph API access.
              <a
                href="https://developers.facebook.com"
                target="_blank"
                rel="noreferrer"
                className="ml-1 underline"
              >
                Set up here →
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-3">
            <span className="text-[11px] text-neutral-500">Meta Graph API · Coming soon</span>
            <button
              type="button"
              disabled
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 text-neutral-500 cursor-not-allowed"
            >
              Connect Instagram
            </button>
          </div>
        </div>

      </div>

      {/* Token Help Box */}
      {!linkedInConnected && (
        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-sm text-blue-300 space-y-1">
          <p className="font-semibold">LinkedIn Setup Tips</p>
          <ul className="text-xs text-blue-400 space-y-1 list-disc list-inside">
            <li>Make sure <strong>http://localhost:5173/linkedin/callback</strong> is added as a redirect URL in your LinkedIn App</li>
            <li>Products needed: <strong>Share on LinkedIn</strong> + <strong>Sign In with LinkedIn using OpenID Connect</strong></li>
            <li>Click "Connect LinkedIn" above to start the OAuth flow</li>
          </ul>
        </div>
      )}
    </div>
  );
};
