import { supabase } from '../supabase';
import type { QuizQuestion } from '../../types';

/**
 * Connects exclusively to:
 * - public.quiz_sets
 * - public.quiz_questions
 * - public.quiz_attempts
 */

export interface QuizSet {
  id: string;
  package_id?: string | null;
  title: string;
  subject: string;
  difficulty: string;
  description?: string;
  total_questions: number;
  created_at?: string;
}

export async function fetchQuizSets(packageId?: string): Promise<QuizSet[]> {
  if (!supabase) return [];

  let query = supabase
    .from('quiz_sets')
    .select('*')
    .order('created_at', { ascending: false });

  if (packageId) {
    query = query.eq('package_id', packageId);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data;
}

export async function createQuizSet(payload: {
  title: string;
  subject: string;
  difficulty: string;
  packageId?: string | null;
  createdBy?: string | null;
}): Promise<QuizSet | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('quiz_sets')
    .insert([{
      title: payload.title,
      subject: payload.subject,
      difficulty: payload.difficulty,
      package_id: payload.packageId ?? null,
      created_by: payload.createdBy ?? null,
      total_questions: 0,
    }])
    .select('*')
    .single();

  if (error) {
    console.warn('createQuizSet error:', error.message);
    return null;
  }
  return data;
}

export async function updateQuizSet(
  setId: string,
  payload: Partial<{ title: string; subject: string; difficulty: string }>
): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from('quiz_sets')
    .update(payload)
    .eq('id', setId);

  if (error) {
    console.warn('updateQuizSet error:', error.message);
    return false;
  }
  return true;
}

export async function deleteQuizSet(setId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('quiz_sets').delete().eq('id', setId);
  if (error) { console.warn('deleteQuizSet error:', error.message); return false; }
  return true;
}

export async function fetchQuizQuestions(setId?: string, subject?: string): Promise<QuizQuestion[]> {
  if (!supabase) return [];

  try {
    let query = supabase.from('quiz_questions').select('*').order('created_at', { ascending: true });

    if (setId) {
      query = query.eq('set_id', setId);
    }
    if (subject && subject !== 'All') {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) return [];

    return data.map((row: any) => ({
      id: row.id,
      question: row.question,
      options: row.options || [],
      correctIndex: row.correct_index,
      explanation: row.explanation || '',
      subject: row.subject,
      difficulty: row.difficulty || 'Moderate',
    }));
  } catch (err) {
    console.warn('fetchQuizQuestions error:', err);
    return [];
  }
}

export async function createQuizQuestion(payload: {
  setId: string;
  subject: string;
  difficulty: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}): Promise<string | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('quiz_questions')
    .insert([{
      set_id: payload.setId,
      subject: payload.subject,
      difficulty: payload.difficulty,
      question: payload.question,
      options: payload.options,
      correct_index: payload.correctIndex,
      explanation: payload.explanation ?? '',
    }])
    .select('id')
    .single();

  if (error) {
    console.warn('createQuizQuestion error:', error.message);
    return null;
  }

  // Increment total_questions on the parent set
  await supabase.rpc('increment_quiz_set_count', { set_id_arg: payload.setId }).catch(() => {
    // If the RPC doesn't exist yet, fall back to a manual update
    supabase!
      .from('quiz_sets')
      .select('total_questions')
      .eq('id', payload.setId)
      .single()
      .then(({ data: setData }) => {
        if (setData) {
          supabase!
            .from('quiz_sets')
            .update({ total_questions: (setData.total_questions ?? 0) + 1 })
            .eq('id', payload.setId);
        }
      });
  });

  return data.id;
}

export async function deleteQuizQuestion(questionId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('quiz_questions').delete().eq('id', questionId);
  if (error) { console.warn('deleteQuizQuestion error:', error.message); return false; }
  return true;
}

export async function recordQuizAttempt(
  profileId: string,
  score: number,
  totalQuestions: number,
  passed: boolean
) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert([
      {
        profile_id: profileId,
        score,
        total_questions: totalQuestions,
        passed,
      },
    ])
    .select('*')
    .single();

  if (error) {
    console.warn('recordQuizAttempt error:', error.message);
    return null;
  }
  return data;
}
