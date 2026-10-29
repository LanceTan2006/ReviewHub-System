export type UserRole = 'student' | 'admin' | 'guest';

export type ActivePage = 
  | 'landing'
  | 'login'
  | 'student-dashboard'
  | 'student-packages'
  | 'student-lessons'
  | 'student-enrollment'
  | 'student-payment'
  | 'ai-reviewer'
  | 'quiz'
  | 'student-progress'
  | 'student-certificates'
  | 'admin-dashboard'
  | 'admin-students'
  | 'admin-enrollment'
  | 'admin-payments'
  | 'admin-packages'
  | 'admin-lessons'
  | 'admin-schedule'
  | 'admin-reports'
  | 'admin-settings';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  enrolledPackage: string;
  targetExam: string;
  examDate: string;
  learningProgress: number;
  quizAverage: number;
  completedLessons: number;
  totalLessons: number;
  role: 'student';
}

export interface ReviewPackage {
  id: string;
  title: string;
  targetAudience: string;
  description: string;
  price: string;
  period: string;
  popular?: boolean;
  features: string[];
  totalModules: number;
  mockExamsCount: number;
  category: 'Licensure' | 'College Entrance' | 'Civil Service' | 'IELTS / Language' | 'Specialized';
  status?: 'Active' | 'Draft' | 'Archived';
  enrollmentCount?: number;
  scoringType?: 'percentage' | 'ielts-band';
}

export interface Lesson {
  id: string;
  title: string;
  subject: string;
  duration: string;
  completed: boolean;
  progressPercent: number;
  instructor: string;
  materialsCount: number;
  nextQuizAvailable: boolean;
  packageId?: string;
  contentSummary?: string;
  keyTakeaways?: string[];
}

export interface PaymentTransaction {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  packageTitle: string;
  amount: string;
  paymentMethod: 'GCash' | 'Maya' | 'Credit/Debit Card' | 'Bank Transfer';
  referenceNumber: string;
  status: 'Verified' | 'Pending' | 'Failed';
  date: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  subject: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: string;
  mastered: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    actionType: 'summary' | 'flashcards' | 'quiz';
  };
}

export interface EnrolledStudentRecord {
  id: string;
  studentId: string;
  name: string;
  email: string;
  packageTitle: string;
  batch: string;
  enrollmentDate: string;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  amount: string;
  academicProgress: number;
}
