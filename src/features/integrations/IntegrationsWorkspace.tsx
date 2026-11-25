import React, { useEffect, useState } from 'react';
import { Instagram, Linkedin, ShieldCheck, CheckCircle, XCircle, ExternalLink, Send, Loader2 } from 'lucide-react';
import {
  startLinkedInOAuth,
  disconnectLinkedIn,
  linkedinTokenStore,
  fetchLinkedInProfile,
  postToLinkedIn,
  type LinkedInProfile,
} from '../../services/social/linkedinService';
import { useToast } from '../../components/feedback/ToastProvider';

export const IntegrationsWorkspace: React.FC = () => {
  const toast = useToast();
  const [linkedInProfile, setLinkedInProfile] = useState<LinkedInProfile | null>(null);
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [testPostText, setTestPostText] = useState('');
  const [posting, setPosting] = useState(false);

  const callbackUrl = `${window.location.origin}/linkedin/callback`;

  useEffect(() => {
    const token = linkedinTokenStore.getToken();
    const profile = linkedinTokenStore.getProfile();
    if (token && profile) {
      setLinkedInConnected(true);
      setLinkedInProfile(profile);
    } else if (token && !profile) {
      fetchLinkedInProfile(token).then((p) => {
        if (p) {
          setLinkedInProfile(p);
          setLinkedInConnected(true);
        } else {
          linkedinTokenStore.clearToken();
        }
      });
    }
  }, []);

  const handleLinkedInConnect = () => {
    try {
      startLinkedInOAuth();
    } catch (err) {
      toast.push({
        tone: 'danger',
        title: 'LinkedIn Config Error',
        detail: err instanceof Error ? err.message : 'Missing LinkedIn Client ID.',
      });
    }
  };

  const handleLinkedInDisconnect = () => {
    disconnectLinkedIn();
    setLinkedInConnected(false);
    setLinkedInProfile(null);
    toast.push({ tone: 'info', title: 'LinkedIn Disconnected' });
  };

  const handleTestPost = async () => {
    if (!testPostText.trim()) return;
    setPosting(true);
    const result = await postToLinkedIn(testPostText.trim());
    setPosting(false);
    if (result.success) {
      setTestPostText('');
      toast.push({
        tone: 'success',
        title: 'Published to LinkedIn!',
        detail: `Post ID: ${result.postId}`,
      });
    } else {
      toast.push({
        tone: 'danger',
        title: 'LinkedIn Post Failed',
        detail: result.error || 'Could not publish post.',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="pb-4 border-b border-[#262626]">
        <h1 className="text-2xl font-bold text-white">Social Platform Integrations</h1>
        <p className="text-xs text-neutral-400 mt-1">
          Connect official APIs for real posting. No passwords stored — OAuth 2.0 only.
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

              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                  linkedInConnected
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {linkedInConnected ? (
                  <>
                    <CheckCircle size={11} /> Connected
                  </>
                ) : (
                  <>
                    <XCircle size={11} /> Disconnected
                  </>
                )}
              </span>
            </div>

            {linkedInProfile && (
              <div className="mt-4 p-3 rounded-xl bg-[#111] border border-[#222] flex items-center gap-3">
                {linkedInProfile.picture && (
                  <img
                    src={linkedInProfile.picture}
                    alt={linkedInProfile.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{linkedInProfile.name}</p>
                  <p className="text-[11px] text-neutral-400 truncate">{linkedInProfile.email}</p>
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

            {linkedInConnected && (
              <div className="mt-4 p-3 rounded-xl bg-[#111] border border-[#252525] space-y-2">
                <p className="text-xs font-semibold text-white">Quick Post to LinkedIn</p>
                <textarea
                  rows={3}
                  value={testPostText}
                  onChange={(e) => setTestPostText(e.target.value)}
                  placeholder="Write a real post to publish straight to your LinkedIn profile…"
                  className="w-full rounded-lg bg-[#181818] border border-[#2e2e2e] p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  disabled={posting || !testPostText.trim()}
                  onClick={handleTestPost}
                  className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {posting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  {posting ? 'Publishing…' : 'Publish Live Post'}
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-3">
            <span className="text-[11px] text-neutral-500">
              {linkedInConnected ? 'Ready to post' : 'OAuth 2.0 · Official API'}
            </span>
            <div className="flex gap-2">
              {linkedInConnected && (
                <a
                  href="https://www.linkedin.com/feed/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1 transition-colors"
                >
                  <ExternalLink size={12} /> Feed
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
          <p className="font-semibold">LinkedIn OAuth Setup Checklist</p>
          <ul className="text-xs text-blue-400 space-y-1 list-disc list-inside">
            <li>
              Redirect URL registered in LinkedIn App → Auth:{' '}
              <code className="px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-200">{callbackUrl}</code>
            </li>
            <li>
              Products enabled in LinkedIn App → Products: <strong>Share on LinkedIn</strong> +{' '}
              <strong>Sign In with LinkedIn using OpenID Connect</strong>
            </li>
            <li>Click &quot;Connect LinkedIn&quot; above — token exchange now runs automatically via VYBE&apos;s server endpoint (no Token Generator needed!).</li>
          </ul>
        </div>
      )}
    </div>
  );
};
