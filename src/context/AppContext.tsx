import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ActivityEvent,
  Agent,
  Comment,
  ContentDraft,
  Conversation,
  SocialAccount,
  UserPreferences,
  UserProfile,
} from '../types';
import {
  DEMO_USER,
  demoAnalytics,
  initialActivity,
  initialAgents,
  initialComments,
  initialConversations,
  initialDrafts,
  initialSocialAccounts,
  initialUserPreferences,
} from '../mocks/data';
import { authService } from '../services/auth/authService';
import { supabaseAuthService } from '../services/supabase/supabaseAuthService';
import { commandProcessor } from '../services/ai/commandProcessor';
import { captionService } from '../services/ai/captionService';
import { localStore } from '../services/storage/localStore';
import { socialPublishingService } from '../services/social';
import { linkedinTokenStore, postToLinkedIn } from '../services/social/linkedinService';
import type { CommandPlan } from '../types';

interface AppState {
  sessionUser: UserProfile | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  preferences: UserPreferences;
  socialAccounts: SocialAccount[];
  agents: Agent[];
  drafts: ContentDraft[];
  activity: ActivityEvent[];
  comments: Comment[];
  conversations: Conversation[];
  analytics: typeof demoAnalytics;
  loginAsDemo: () => void;
  loginWithGoogleCredential: (credential: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: (prefs: Partial<UserPreferences>) => void;
  skipOnboarding: () => void;
  setPreferences: (prefs: UserPreferences) => void;
  addDraft: (draft: Omit<ContentDraft, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => string;
  updateDraft: (id: string, patch: Partial<ContentDraft>) => void;
  deleteDraft: (id: string) => void;
  approveComment: (id: string, reply: string) => void;
  ignoreComment: (id: string) => void;
  updateConversation: (id: string, patch: Partial<Conversation>) => void;
  toggleAccount: (id: string) => void;
  runCommand: (command: string) => Promise<CommandPlan>;
  generateCaptions: (topic: string, platforms: ContentDraft['platforms'], tone: UserPreferences['writingStyle']) => ReturnType<typeof captionService.generate>[];
  requestPublish: (draftId: string, draftOverride?: Pick<ContentDraft, 'platforms' | 'linkedin' | 'brief'>) => Promise<string>;
  clearDemoData: () => void;
  // Aliases for unified UI components
  activityLogs: ActivityEvent[];
  messages: Conversation[];
  executeCommand: (command: string) => Promise<string>;
  approveCommentReply: (id: string, reply: string) => void;
  toggleAccountStatus: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const existing = authService.getSession();
  const [sessionUser, setSessionUser] = useState<UserProfile | null>(existing?.user ?? null);

  // ── Subscribe to Supabase auth state changes (SSO, token refresh, etc.) ──
  const supabaseSubRef = useRef<{ unsubscribe: () => void } | null>(null);
  useEffect(() => {
    // Restore session from Supabase if available
    supabaseAuthService.getSession().then((session) => {
      if (session?.user && !sessionUser) {
        setSessionUser(session.user);
      }
    });

    // Live listener
    supabaseSubRef.current = supabaseAuthService.onAuthChange((profile) => {
      setSessionUser(profile);
      if (!profile) {
        localStore.remove('session');
      }
    });

    return () => {
      supabaseSubRef.current?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [isOnboarded, setIsOnboarded] = useState(() => localStore.get('onboarded', false));
  const [preferences, setPreferencesState] = useState<UserPreferences>(() =>
    localStore.get('prefs', initialUserPreferences),
  );
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>(() =>
    localStore.get('accounts', initialSocialAccounts),
  );
  const [agents] = useState<Agent[]>(initialAgents);
  const [drafts, setDrafts] = useState<ContentDraft[]>(() => localStore.get('drafts', initialDrafts));
  const [activity, setActivity] = useState<ActivityEvent[]>(() => localStore.get('activity', initialActivity));
  const [comments, setComments] = useState<Comment[]>(() => localStore.get('comments', initialComments));
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    localStore.get('inbox', initialConversations),
  );

  useEffect(() => localStore.set('prefs', preferences), [preferences]);
  useEffect(() => localStore.set('accounts', socialAccounts), [socialAccounts]);
  useEffect(() => localStore.set('drafts', drafts), [drafts]);
  useEffect(() => localStore.set('activity', activity), [activity]);
  useEffect(() => localStore.set('comments', comments), [comments]);
  useEffect(() => localStore.set('inbox', conversations), [conversations]);
  useEffect(() => localStore.set('onboarded', isOnboarded), [isOnboarded]);

  const loginAsDemo = () => {
    const session = authService.signInDemo({ displayName: preferences.displayName });
    setSessionUser(session.user);
  };

  const loginWithGoogleCredential = async (credential: string) => {
    // Use Supabase auth (falls back to JWT decode if Supabase unreachable)
    const session = await supabaseAuthService.signInWithGoogleIdToken(credential);
    setSessionUser(session.user);
    if (session.user.displayName) {
      setPreferencesState((p) => ({ ...p, displayName: session.user.displayName }));
    }
  };

  const logout = () => {
    supabaseAuthService.signOut();
    setSessionUser(null);
  };

  const completeOnboarding = (prefs: Partial<UserPreferences>) => {
    setPreferencesState((p) => ({ ...p, ...prefs }));
    setIsOnboarded(true);
  };

  const addDraft: AppState['addDraft'] = (draft) => {
    const id = draft.id ?? `draft_${Date.now()}`;
    const now = new Date().toISOString();
    setDrafts((prev) => [{ ...draft, id, createdAt: now, updatedAt: now }, ...prev]);
    return id;
  };

  const updateDraft = (id: string, patch: Partial<ContentDraft>) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d)),
    );
  };

  const log = (event: Omit<ActivityEvent, 'id' | 'startedAt'> & { startedAt?: string }) => {
    const item: ActivityEvent = {
      ...event,
      id: `act_${Date.now()}`,
      startedAt: event.startedAt ?? new Date().toISOString(),
    };
    setActivity((prev) => [item, ...prev]);
  };

  const runCommand = async (command: string) => {
    const plan = await commandProcessor.plan(command);
    log({
      taskName: plan.title,
      triggerCommand: command,
      agent: 'Workflow Manager',
      platform: 'system',
      status: plan.steps.some((s) => s.status === 'awaiting_approval') ? 'awaiting_approval' : plan.intent === 'unknown' ? 'draft' : 'succeeded',
      stepsCompleted: plan.steps.filter((s) => s.status === 'succeeded').length,
      stepsTotal: plan.steps.length,
      details: plan.summary,
    });
    return plan;
  };

  const requestPublish = async (
    draftId: string,
    draftOverride?: Pick<ContentDraft, 'platforms' | 'linkedin' | 'brief'>,
  ) => {
    const draft = draftOverride ?? drafts.find((d) => d.id === draftId);
    const wantsLinkedIn = draft?.platforms.includes('linkedin');

    if (wantsLinkedIn && linkedinTokenStore.isConnected()) {
      const li = draft?.linkedin;
      const text = [li?.hook, li?.caption, li?.cta, li?.hashtags?.join(' ')]
        .filter(Boolean)
        .join('\n\n') || draft?.brief || '';

      if (!text.trim()) {
        const reason = 'Cannot publish an empty LinkedIn post. Add text or generate captions first.';
        updateDraft(draftId, { status: 'failed' });
        return reason;
      }

      const liRes = await postToLinkedIn(text);
      if (liRes.success) {
        updateDraft(draftId, { status: 'published' });
        const igNote = draft?.platforms.includes('instagram')
          ? ' (Instagram skipped — Meta Graph API not connected)'
          : '';
        const detail = `Published live to LinkedIn (Post ID: ${liRes.postId})${igNote}`;
        log({
          taskName: 'Published to LinkedIn',
          triggerCommand: `Publish draft ${draftId}`,
          agent: 'Publishing Agent',
          platform: 'linkedin',
          status: 'succeeded',
          stepsCompleted: 3,
          stepsTotal: 3,
          details: detail,
          completedAt: new Date().toISOString(),
        });
        return detail;
      }

      updateDraft(draftId, { status: 'failed' });
      log({
        taskName: 'LinkedIn publish failed',
        triggerCommand: `Publish draft ${draftId}`,
        agent: 'Publishing Agent',
        platform: 'linkedin',
        status: 'failed',
        stepsCompleted: 2,
        stepsTotal: 3,
        details: liRes.error || 'LinkedIn API rejected the post.',
        error: liRes.error,
        completedAt: new Date().toISOString(),
      });
      return liRes.error || 'LinkedIn publish failed.';
    }

    const result = await socialPublishingService.publish(draftId);
    updateDraft(draftId, { status: 'failed' });
    log({
      taskName: 'Publishing request',
      triggerCommand: `Publish draft ${draftId}`,
      agent: 'Publishing Agent',
      platform: 'both',
      status: 'failed',
      stepsCompleted: 1,
      stepsTotal: 3,
      details: result.reason,
      error: result.reason,
      completedAt: new Date().toISOString(),
    });
    return result.reason;
  };

  const value = useMemo<AppState>(
    () => ({
      sessionUser,
      isAuthenticated: Boolean(sessionUser),
      isOnboarded,
      preferences,
      socialAccounts,
      agents,
      drafts,
      activity,
      comments,
      conversations,
      analytics: demoAnalytics,
      loginAsDemo,
      loginWithGoogleCredential,
      logout,
      completeOnboarding,
      skipOnboarding: () => setIsOnboarded(true),
      setPreferences: setPreferencesState,
      addDraft,
      updateDraft,
      deleteDraft: (id) => setDrafts((p) => p.filter((d) => d.id !== id)),
      approveComment: (id, reply) => {
        setComments((p) => p.map((c) => (c.id === id ? { ...c, status: 'replied', suggestedReply: reply } : c)));
        log({
          taskName: 'Comment reply approved (local only)',
          triggerCommand: 'User approved a drafted reply',
          agent: 'Engagement Agent',
          platform: 'both',
          status: 'succeeded',
          stepsCompleted: 1,
          stepsTotal: 1,
          details: 'Reply stored locally. Comment APIs are not connected, so nothing was posted.',
          completedAt: new Date().toISOString(),
        });
      },
      ignoreComment: (id) => setComments((p) => p.map((c) => (c.id === id ? { ...c, status: 'ignored' } : c))),
      updateConversation: (id, patch) =>
        setConversations((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c))),
      toggleAccount: (id) =>
        setSocialAccounts((p) =>
          p.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: a.status === 'not_connected' ? 'demo_connection' : 'not_connected',
                }
              : a,
          ),
        ),
      runCommand,
      generateCaptions: (topic, platforms, tone) =>
        platforms.map((platform) => captionService.generate({ topic, platform, preferences, tone })),
      requestPublish,
      clearDemoData: () => {
        supabaseAuthService.signOut();
        localStore.clearDemo();
        setSessionUser(null);
        setIsOnboarded(false);
        setPreferencesState(initialUserPreferences);
        setSocialAccounts(initialSocialAccounts);
        setDrafts(initialDrafts);
        setActivity(initialActivity);
        setComments(initialComments);
        setConversations(initialConversations);
      },
      activityLogs: activity,
      messages: conversations,
      executeCommand: async (command: string) => {
        const plan = await runCommand(command);
        return plan.summary;
      },
      approveCommentReply: (id: string, reply: string) => {
        setComments((p) => p.map((c) => (c.id === id ? { ...c, status: 'replied', suggestedReply: reply } : c)));
      },
      toggleAccountStatus: (id: string) => {
        setSocialAccounts((p) =>
          p.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: a.status === 'not_connected' ? 'demo_connection' : 'not_connected',
                }
              : a,
          ),
        );
      },
    }),
    [sessionUser, isOnboarded, preferences, socialAccounts, agents, drafts, activity, comments, conversations],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

export { DEMO_USER };
