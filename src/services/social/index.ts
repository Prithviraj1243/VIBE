import type { Comment, Conversation, SocialAccount } from '../../types';

export interface SocialPublishingService {
  prepare(draftId: string): Promise<{ ok: false; reason: string }>;
  publish(draftId: string): Promise<{ ok: false; reason: string }>;
}

export interface CommentService {
  list(): Comment[];
}

export interface InboxService {
  list(): Conversation[];
}

export const socialPublishingService: SocialPublishingService = {
  async prepare() {
    return {
      ok: false,
      reason: 'Publishing is not connected. VYBE prepared a local request only.',
    };
  },
  async publish() {
    return {
      ok: false,
      reason: 'No official Instagram or LinkedIn publish API is authorized in this build.',
    };
  },
};

export function connectionLabel(account: SocialAccount) {
  switch (account.status) {
    case 'demo_connection':
      return 'Demo connection';
    case 'connected':
      return 'Connected';
    case 'needs_attention':
      return 'Needs attention';
    default:
      return 'Not connected';
  }
}
