// ── User Roles ────────────────────────────────────────────────
export type UserRole = 'guest' | 'student' | 'frontdesk' | 'proctor' | 'manager' | 'admin';

// ── All navigable pages in the SPA ───────────────────────────
export type ActivePage =
  // Public
  | 'landing'
  | 'login'

  // Student pages
  | 'student-dashboard'
  | 'student-profile'
  | 'student-packages'
  | 'student-enrollment'
  | 'student-payment'
  | 'student-lessons'
  | 'quiz'
  | 'student-mock-exam'
  | 'ai-reviewer'
  | 'student-certificates'
  | 'student-announcements'

  // Front Desk / Staff pages
  | 'frontdesk-dashboard'
  | 'frontdesk-students'
  | 'frontdesk-enrollment'
  | 'frontdesk-payments'
  | 'frontdesk-schedule'
  | 'frontdesk-reports'
  | 'frontdesk-announcements'
  | 'frontdesk-profile'

  // Proctor pages
  | 'proctor-dashboard'
  | 'proctor-lessons'
  | 'proctor-quiz'
  | 'proctor-mock-exam'
  | 'proctor-performance'
  | 'proctor-announcements'
  | 'proctor-profile'

  // Manager pages
  | 'manager-dashboard'
  | 'manager-users'
  | 'manager-students'
  | 'manager-packages'
  | 'manager-enrollment'
  | 'manager-payments'
  | 'manager-schedule'
  | 'manager-reports'
  | 'manager-analytics'
  | 'manager-settings'
  | 'manager-backup'
  | 'manager-announcements'
  | 'manager-profile'

  // Legacy admin pages (kept for backward-compat with existing pages)
  | 'admin-dashboard'
  | 'admin-students'
  | 'admin-enrollment'
  | 'admin-payments'
  | 'admin-packages'
  | 'admin-lessons'
  | 'admin-schedule'
  | 'admin-reports'
  | 'admin-settings'

  // Shared
  | 'student-progress'
  | 'student-packages-view';

// ── Domain interfaces ─────────────────────────────────────────
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

// ── User Management (Manager only) ───────────────────────────
export interface UserManagementRecord {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  status: 'Active' | 'Suspended';
  lastLogin: string;
  createdAt: string;
}
