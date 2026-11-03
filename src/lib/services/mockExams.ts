import { supabase } from '../supabase';
import type { QuizQuestion } from '../../types';

/**
 * Connects exclusively to:
 * - public.mock_exams
 * - public.mock_exam_questions
 */

export interface MockExam {
  id: string;
  title: string;
  package_id?: string | null;
  total_questions: number;
  duration_minutes: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
}

export async function fetchMockExams(packageId?: string): Promise<MockExam[]> {
  if (!supabase) return [];

  let query = supabase.from('mock_exams').select('*').order('created_at', { ascending: true });
  if (packageId) {
    query = query.eq('package_id', packageId);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data;
}

export async function fetchMockExamQuestions(examId: string): Promise<QuizQuestion[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('mock_exam_questions')
    .select('*')
    .eq('exam_id', examId)
    .order('created_at', { ascending: true });

  if (error || !data || data.length === 0) return [];

  return data.map((row: any) => ({
    id: row.id,
    question: row.question,
    options: row.options || [],
    correctIndex: row.correct_index,
    explanation: row.explanation || '',
    subject: 'Mock Exam',
    difficulty: 'Challenging',
  }));
}
