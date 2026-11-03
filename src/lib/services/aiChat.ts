import { supabase } from '../supabase';

/**
 * Connects exclusively to:
 * - public.ai_chat_sessions
 * - public.ai_chat_messages
 */

export interface AiChatSession {
  id: string;
  profile_id: string;
  title: string;
  created_at: string;
}

export interface AiChatMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'ai';
  message: string;
  created_at: string;
}

export async function fetchAiChatSessions(profileId: string): Promise<AiChatSession[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('ai_chat_sessions')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function createAiChatSession(profileId: string, title: string = 'AI Review Session'): Promise<string | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('ai_chat_sessions')
    .insert([{ profile_id: profileId, title }])
    .select('id')
    .single();

  if (error || !data) return null;
  return data.id;
}

export async function fetchAiChatMessages(sessionId: string): Promise<AiChatMessage[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('ai_chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  return data;
}

export async function saveAiChatMessage(
  sessionId: string,
  sender: 'user' | 'ai',
  message: string
): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from('ai_chat_messages').insert([
    {
      session_id: sessionId,
      sender,
      message,
    },
  ]);

  if (error) {
    console.warn('saveAiChatMessage error:', error.message);
    return false;
  }
  return true;
}
