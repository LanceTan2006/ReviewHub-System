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
  item_count: number;
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
      item_count: 0,
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
    let query = supabase.from('quiz_questions').select('*').order('item_order', { ascending: true });

    if (setId) {
      // quiz_set_id is the live not-null column; set_id is the legacy alias
      query = query.or(`quiz_set_id.eq.${setId},set_id.eq.${setId}`);
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
      quiz_set_id: payload.setId,   // live not-null column
      set_id: payload.setId,        // legacy alias kept in sync
      subject: payload.subject,
      difficulty: payload.difficulty,
      question: payload.question,
      options: payload.options,
      correct_index: payload.correctIndex,
      explanation: payload.explanation ?? '',
      item_order: 0,
    }])
    .select('id')
    .single();

  if (error) {
    console.warn('createQuizQuestion error:', error.message);
    return null;
  }

  // Increment both counters on the parent set (fire-and-forget)
  void (async () => {
    try {
      const { data: setData } = await supabase!
        .from('quiz_sets')
        .select('total_questions, item_count')
        .eq('id', payload.setId)
        .single();
      if (setData) {
        await supabase!
          .from('quiz_sets')
          .update({
            total_questions: (setData.total_questions ?? 0) + 1,
            item_count:      (setData.item_count      ?? 0) + 1,
          })
          .eq('id', payload.setId);
      }
    } catch { /* non-critical */ }
  })();

  return data.id;
}

export async function deleteQuizQuestion(questionId: string): Promise<boolean> {
  if (!supabase) return false;

  // Look up which set this question belongs to before deleting
  const { data: qData } = await supabase
    .from('quiz_questions')
    .select('quiz_set_id, set_id')
    .eq('id', questionId)
    .single();

  const { error } = await supabase.from('quiz_questions').delete().eq('id', questionId);
  if (error) { console.warn('deleteQuizQuestion error:', error.message); return false; }

  // Decrement counters on parent set (fire-and-forget)
  const parentSetId = qData?.quiz_set_id ?? qData?.set_id;
  if (parentSetId) {
    void (async () => {
      try {
        const { data: setData } = await supabase!
          .from('quiz_sets')
          .select('total_questions, item_count')
          .eq('id', parentSetId)
          .single();
        if (setData && setData.total_questions > 0) {
          await supabase!
            .from('quiz_sets')
            .update({
              total_questions: setData.total_questions - 1,
              item_count: Math.max(0, (setData.item_count ?? 0) - 1),
            })
            .eq('id', parentSetId);
        }
      } catch { /* non-critical */ }
    })();
  }

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
