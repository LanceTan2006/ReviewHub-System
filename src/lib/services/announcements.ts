import { supabase } from '../supabase';

/**
 * Connects exclusively to:
 * - public.announcements
 */

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  audience: string;
  created_at: string;
  created_by?: string;
}

export async function fetchAnnouncements(audience: string = 'all'): Promise<AnnouncementItem[]> {
  if (!supabase) return [];

  let query = supabase.from('announcements').select('*').order('created_at', { ascending: false });

  if (audience && audience !== 'all') {
    query = query.in('audience', ['all', audience]);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data;
}

export async function createAnnouncement(payload: {
  title: string;
  body: string;
  audience: string;
  createdBy?: string;
}): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from('announcements').insert([
    {
      title: payload.title,
      body: payload.body,
      audience: payload.audience,
      created_by: payload.createdBy || null,
    },
  ]);

  if (error) {
    console.warn('createAnnouncement error:', error.message);
    return false;
  }
  return true;
}
