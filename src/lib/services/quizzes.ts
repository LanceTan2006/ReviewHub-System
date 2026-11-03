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
  description?: string;
  total_questions: number;
}

export async function fetchQuizSets(packageId?: string): Promise<QuizSet[]> {
  if (!supabase) return [];

  let query = supabase.from('quiz_sets').select('*').order('created_at', { ascending: true });
  if (packageId) {
    query = query.eq('package_id', packageId);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data;
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
