export type Platform = 'instagram' | 'linkedin';
export type ConnectionStatus = 'connected' | 'not_connected' | 'needs_attention' | 'demo_connection';
export type AgentStatus = 'active' | 'idle' | 'needs_approval' | 'unavailable' | 'busy';
export type AutonomyMode = 'review' | 'balanced' | 'autopilot';
export type WritingStyle = 'casual' | 'professional' | 'bold' | 'educational' | 'custom';
export type CaptionLength = 'short' | 'medium' | 'detailed';
export type HashtagPreference = 'minimal' | 'moderate' | 'high';
export type ContentStatus = 'draft' | 'queued' | 'scheduled' | 'published' | 'failed' | 'needs_review' | 'awaiting_approval';
export type WorkflowStatus =
  | 'draft'
  | 'queued'
  | 'running'
  | 'awaiting_approval'
  | 'succeeded'
  | 'failed'
  | 'cancelled';
export type CommentIntent =
  | 'positive'
  | 'question'
  | 'collaboration'
  | 'lead'
  | 'negative'
  | 'spam'
  | 'other';
export type DataSource = 'demo' | 'live';

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
  timeZone: string;
  language: string;
  authMode: 'demo' | 'google_pending';
}

export interface UserPreferences {
  displayName: string;
  writingStyle: WritingStyle;
  language: string;
  captionLength: CaptionLength;
  emojiUsage: boolean;
  hashtagDensity: HashtagPreference;
  autonomyMode: AutonomyMode;
  brandVoice: string;
  phrasesToUse: string;
  phrasesToAvoid: string;
  defaultCta: string;
  enabledAgents: string[];
  actionPermissions: ActionPermissions;
}

export interface ActionPermissions {
  publishPosts: boolean;
  schedulePosts: boolean;
  replyToComments: boolean;
  sendMessages: boolean;
  deleteContent: boolean;
}

export interface SocialAccount {
  id: string;
  platform: Platform;
  handle: string;
  name: string;
  avatar?: string;
  status: ConnectionStatus;
  lastSynced?: string;
  scopes: string[];
  supportedActions: string[];
  notes: string;
  followerCount?: string;
  engagementRate?: string;
}

// Aliases for unified feature consumers
export type PostDraft = ContentDraft;
export type ActivityLog = ActivityEvent;
export type CommentItem = Comment;
export type InboxMessage = Conversation;


export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  avatarIcon: string;
  status: AgentStatus;
  capabilities: string[];
  tasksDoneCount: number;
  lastActive: string;
  pendingApprovals: number;
  recentRuns: { id: string; label: string; status: WorkflowStatus; at: string }[];
}

export interface ContentDraft {
  id: string;
  title: string;
  brief: string;
  mediaUrl?: string;
  mediaName?: string;
  mediaType?: 'image' | 'video';
  mediaSource: 'local' | 'remote' | 'none';
  platforms: Platform[];
  instagram: PlatformCopy;
  linkedin: PlatformCopy;
  status: ContentStatus;
  scheduledTime?: string;
  createdAt: string;
  updatedAt: string;
  tone: string;
}

export interface PlatformCopy {
  hook: string;
  caption: string;
  hashtags: string[];
  cta: string;
}

export interface WorkflowStep {
  id: string;
  agent: string;
  action: string;
  status: WorkflowStatus;
  note?: string;
}

export interface Workflow {
  id: string;
  name: string;
  triggerCommand: string;
  agent: string;
  platform: Platform | 'both' | 'system';
  status: WorkflowStatus;
  steps: WorkflowStep[];
  startedAt: string;
  completedAt?: string;
  error?: string;
  mock: boolean;
}

export interface ActivityEvent {
  id: string;
  taskName: string;
  triggerCommand: string;
  agent: string;
  platform: Platform | 'both' | 'system';
  startedAt: string;
  completedAt?: string;
  status: WorkflowStatus;
  stepsCompleted: number;
  stepsTotal: number;
  details: string;
  error?: string;
}

export interface Comment {
  id: string;
  author: string;
  authorHandle: string;
  authorAvatar?: string;
  platform: Platform;
  postTitle: string;
  commentText: string;
  timestamp: string;
  intent: CommentIntent;
  suggestedReply: string;
  status: 'pending' | 'approved' | 'replied' | 'ignored';
  sensitive: boolean;
}

export interface Conversation {
  id: string;
  sender: string;
  senderAvatar?: string;
  platform: Platform;
  preview: string;
  timestamp: string;
  unread: boolean;
  important: boolean;
  handled: boolean;
  isLead: boolean;
  aiSummary: string;
  suggestedResponse: string;
  accessNote: string;
  messages: { sender: 'user' | 'contact'; text: string; timestamp: string }[];
}

export interface ApprovalRequest {
  id: string;
  kind: 'caption' | 'reply' | 'message' | 'publish' | 'schedule';
  title: string;
  summary: string;
  status: 'awaiting_approval' | 'approved' | 'rejected';
  href: string;
}

export interface AnalyticsSnapshot {
  source: DataSource;
  periodLabel: string;
  postsPublished: number;
  engagement: number;
  pendingContent: number;
  unanswered: number;
  series: { date: string; instagram: number; linkedin: number }[];
  posts: {
    id: string;
    title: string;
    platform: Platform;
    type: 'reel' | 'carousel' | 'image' | 'article';
    impressions: number;
    engagement: number;
  }[];
  weeklySummary: string;
}

export interface AuthSession {
  user: UserProfile;
  mode: 'demo';
  issuedAt: string;
}

export interface CommandPlan {
  intent:
    | 'captions'
    | 'comments'
    | 'inbox'
    | 'calendar'
    | 'analytics'
    | 'failed_workflows'
    | 'unknown';
  title: string;
  summary: string;
  steps: WorkflowStep[];
  href?: string;
  mock: true;
}
