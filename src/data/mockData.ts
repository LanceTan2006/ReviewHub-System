import { ReviewPackage, Lesson, QuizQuestion, Flashcard, EnrolledStudentRecord } from '../types';

export const reviewPackages: ReviewPackage[] = [];
export const sampleLessons: Lesson[] = [];
export const sampleQuizQuestions: QuizQuestion[] = [];
export const sampleFlashcards: Flashcard[] = [];
export const sampleEnrolledStudents: EnrolledStudentRecord[] = [];
export const sampleSummaryContent = {
  title: '',
  generatedAt: '',
  sourceFile: '',
  keyTakeaways: [],
  highYieldFormulas: [],
  recommendedReviewFocus: [],
};
export const sampleIeltsQuestions: QuizQuestion[] = [];

export interface IeltsBandDescriptor {
  band: number;
  label: string;
  cefr: string;
  summary: string;
}

export const getIeltsBandScore = (correctCount: number, totalQuestions: number = 5): IeltsBandDescriptor => {
  const percentage = (correctCount / totalQuestions) * 100;

  if (percentage >= 100) {
    return { band: 9.0, label: 'Shell', cefr: 'Ready', summary: 'No seeded content loaded yet.' };
  }

  if (percentage >= 80) {
    return { band: 8.0, label: 'Ready', cefr: 'Setup', summary: 'Database content will be added after the schema is ready.' };
  }

  return { band: 0, label: 'Empty', cefr: 'Shell', summary: 'This frontend is intentionally blank until your database is added.' };
};

export const samplePaymentTransactions = [];

