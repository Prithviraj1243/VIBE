/**
 * supabaseDb.ts
 * Thin helpers for reading/writing VYBE data to Supabase tables.
 * All methods fail-silently and log a warning, so the app keeps working
 * even without a live Supabase connection (pure demo mode).
 */
import { supabase } from './client';
import type { ContentDraft, UserPreferences } from '../../types';

// ─── User Profiles ────────────────────────────────────────────────────────────

export const dbProfiles = {
  async upsert(userId: string, data: Partial<UserPreferences> & { display_name?: string; avatar_url?: string; email?: string }) {
    try {
      await supabase.from('user_profiles').upsert({ id: userId, ...data, updated_at: new Date().toISOString() });
    } catch (err) {
      console.warn('[SupabaseDB] upsert user_profiles failed:', err);
    }
  },

  async get(userId: string) {
    try {
      const { data } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
      return data;
    } catch {
      return null;
    }
  },
};

// ─── Content Drafts ───────────────────────────────────────────────────────────

export const dbDrafts = {
  async list(userId: string): Promise<ContentDraft[]> {
    try {
      const { data, error } = await supabase
        .from('content_drafts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ContentDraft[];
    } catch (err) {
      console.warn('[SupabaseDB] list drafts failed:', err);
      return [];
    }
  },

  async upsert(userId: string, draft: ContentDraft) {
    try {
      await supabase.from('content_drafts').upsert({
        id: draft.id,
        user_id: userId,
        title: draft.title,
        brief: draft.brief,
        platforms: draft.platforms,
        status: draft.status,
        scheduled_at: draft.scheduledTime,
        created_at: draft.createdAt,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('[SupabaseDB] upsert draft failed:', err);
    }
  },

  async remove(id: string) {
    try {
      await supabase.from('content_drafts').delete().eq('id', id);
    } catch (err) {
      console.warn('[SupabaseDB] delete draft failed:', err);
    }
  },
};

// ─── Activity Logs ────────────────────────────────────────────────────────────

export const dbActivity = {
  async insert(userId: string, event: { id: string; task_name: string; agent: string; platform: string; status: string; details?: string }) {
    try {
      await supabase.from('activity_logs').insert({ ...event, user_id: userId, started_at: new Date().toISOString() });
    } catch (err) {
      console.warn('[SupabaseDB] insert activity failed:', err);
    }
  },
};
