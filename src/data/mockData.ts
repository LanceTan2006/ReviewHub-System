import { ReviewPackage, Lesson, QuizQuestion, Flashcard, EnrolledStudentRecord, PaymentTransaction } from '../types';

export const reviewPackages: ReviewPackage[] = [];
export const sampleLessons: Lesson[] = [];
export const sampleFlashcards: Flashcard[] = [];
export const sampleEnrolledStudents: EnrolledStudentRecord[] = [];
export const samplePaymentTransactions: PaymentTransaction[] = [];
export const sampleSummaryContent = {
  title: 'Module 4 — Thermodynamics & Fluid Transport',
  generatedAt: 'Nov 3, 2026',
  sourceFile: 'Lecture_04_Thermo_Fluids_Notes.pdf',
  keyTakeaways: [
    'The Second Law of Thermodynamics states entropy of an isolated system never decreases.',
    'Carnot cycle is the theoretical maximum efficiency cycle between two heat reservoirs.',
    'Reynolds number (Re) determines flow regime: Re < 2100 = laminar, Re > 4000 = turbulent.',
    'Darcy-Weisbach equation calculates head loss due to friction in pipe flow.',
  ],
  highYieldFormulas: [
    'η_Carnot = 1 - (T_L / T_H)',
    'Re = ρvD / μ',
    'h_f = f · (L/D) · (v²/2g)',
  ],
  recommendedReviewFocus: [
    'Entropy and irreversibility in closed systems',
    'Pipe head loss calculations',
    'Laminar vs turbulent flow identification',
  ],
};

// ── Fallback quiz questions (shown when Supabase has no data yet) ─────────────
// These match exactly what is seeded in schema.sql so the experience is consistent.
export const sampleQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'According to the Second Law of Thermodynamics, which statement correctly describes the behavior of a closed natural system?',
    options: [
      'The total energy always increases',
      'The entropy of an isolated system never decreases spontaneously',
      'Heat flows from cold to hot without work',
      'Absolute zero is achievable in finite cycles',
    ],
    correctIndex: 1,
    explanation: 'The entropy of an isolated system always increases or remains constant over time. Natural processes are irreversible.',
    subject: 'Thermodynamics',
    difficulty: 'Moderate',
  },
  {
    id: 2,
    question: 'Which constitutional section protects a person from self-incrimination during custodial investigations?',
    options: [
      'Article III, Section 12',
      'Article V, Section 2',
      'Article VI, Section 1',
      'Article IX, Section 2',
    ],
    correctIndex: 0,
    explanation: 'Article III, Section 12 protects the right to remain silent and to have independent counsel.',
    subject: 'Constitutional Law',
    difficulty: 'Easy',
  },
  {
    id: 3,
    question: 'If Reynolds number is 1450 in a pipe, which flow regime is present?',
    options: ['Turbulent', 'Critical transition', 'Laminar', 'Sonic'],
    correctIndex: 2,
    explanation: 'Re < 2100 indicates laminar flow inside pipes.',
    subject: 'Fluid Dynamics',
    difficulty: 'Moderate',
  },
  {
    id: 4,
    question: 'Which compound gives a positive Tollens test?',
    options: ['Propanone', 'Benzophenone', 'Ethanal', 'Ethyl ethanoate'],
    correctIndex: 2,
    explanation: 'Aldehydes reduce Tollens reagent to silver metal. Ethanal is an aldehyde.',
    subject: 'Organic Chemistry',
    difficulty: 'Challenging',
  },
  {
    id: 5,
    question: 'If variance is 36, what is the standard deviation?',
    options: ['18', '6', '72', '1296'],
    correctIndex: 1,
    explanation: 'The standard deviation is the square root of the variance: sqrt(36) = 6.',
    subject: 'Statistics',
    difficulty: 'Easy',
  },
];

// ── IELTS fallback questions ───────────────────────────────────────────────────
export const sampleIeltsQuestions: QuizQuestion[] = [
  {
    id: 101,
    question: 'In IELTS Writing Task 2, which of the following best describes a "cohesive device"?',
    options: [
      'A statistical figure used to support an argument',
      'A linking word or phrase that connects ideas across sentences',
      'A complex sentence structure with multiple clauses',
      'A vocabulary word with a high Academic Word List frequency',
    ],
    correctIndex: 1,
    explanation: 'Cohesive devices (e.g., however, furthermore, as a result) link ideas and improve text flow, contributing to the Coherence & Cohesion band score.',
    subject: 'IELTS',
    difficulty: 'Moderate',
  },
  {
    id: 102,
    question: 'Which IELTS band score corresponds to a "Good User" who has occasional inaccuracies but generally handles complex language?',
    options: ['Band 5.5', 'Band 6.0', 'Band 7.0', 'Band 8.0'],
    correctIndex: 2,
    explanation: 'Band 7 is described as a Good User — handles complex language well with occasional inaccuracies.',
    subject: 'IELTS',
    difficulty: 'Easy',
  },
  {
    id: 103,
    question: 'In IELTS Academic Reading, a "True / False / Not Given" question requires you to:',
    options: [
      'Decide if the statement matches the writer\'s opinion',
      'Identify whether the statement agrees with, contradicts, or is absent from the passage',
      'Summarise the passage in one sentence',
      'Choose the best heading for the paragraph',
    ],
    correctIndex: 1,
    explanation: 'True = matches information in the passage; False = contradicts it; Not Given = no information either way.',
    subject: 'IELTS',
    difficulty: 'Moderate',
  },
  {
    id: 104,
    question: 'Which grammar structure most effectively raises a Writing Task 2 score for Grammatical Range & Accuracy?',
    options: [
      'Exclusively simple present-tense sentences',
      'Mixing conditionals, passive voice, and relative clauses accurately',
      'Repeating key vocabulary from the question prompt',
      'Writing shorter sentences to avoid errors',
    ],
    correctIndex: 1,
    explanation: 'Examiners reward a range of accurately used structures — conditionals, passive constructions, and relative clauses demonstrate grammatical range.',
    subject: 'IELTS',
    difficulty: 'Challenging',
  },
  {
    id: 105,
    question: 'In IELTS Listening, what should you do when you miss an answer?',
    options: [
      'Stop the recording and replay the section',
      'Leave it blank and focus on the next question',
      'Write your best guess and keep listening',
      'Ask the examiner for clarification',
    ],
    correctIndex: 2,
    explanation: 'Write your best guess immediately and move on — stopping to worry about a missed answer causes you to miss subsequent answers.',
    subject: 'IELTS',
    difficulty: 'Easy',
  },
];

export interface IeltsBandDescriptor {
  band: number;
  label: string;
  cefr: string;
  summary: string;
}

export const getIeltsBandScore = (correctCount: number, totalQuestions: number = 5): IeltsBandDescriptor => {
  const pct = (correctCount / totalQuestions) * 100;
  if (pct >= 90) return { band: 8.5, label: 'Very Good User', cefr: 'C2', summary: 'Excellent command of the language. Only occasional unsystematic inaccuracies.' };
  if (pct >= 80) return { band: 7.5, label: 'Good User',      cefr: 'C1', summary: 'Good operational command with occasional inaccuracies. Handles complex language well.' };
  if (pct >= 70) return { band: 6.5, label: 'Competent User', cefr: 'B2', summary: 'Generally effective command despite inaccuracies and misunderstandings.' };
  if (pct >= 60) return { band: 6.0, label: 'Competent User', cefr: 'B2', summary: 'Generally effective but with noticeable inaccuracies, particularly in unfamiliar situations.' };
  if (pct >= 50) return { band: 5.5, label: 'Modest User',    cefr: 'B1', summary: 'Partial command of the language. Copes with overall meaning in most situations.' };
  if (pct >= 40) return { band: 5.0, label: 'Modest User',    cefr: 'B1', summary: 'Partial command. Uses language in familiar situations, handling basic communication.' };
  return           { band: 4.5, label: 'Limited User',    cefr: 'A2', summary: 'Basic competence limited to familiar situations. Frequent problems in understanding.' };
};
