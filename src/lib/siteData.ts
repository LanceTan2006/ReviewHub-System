import { supabase } from './supabase';
import { reviewPackages as fallbackPackages, sampleLessons as fallbackLessons } from '../data/mockData';
import type { Lesson, PaymentTransaction, ReviewPackage } from '../types';

const normalizeCurrency = (value: number | string | null | undefined): string => {
  const numericValue = Number(value ?? 0);
  if (!Number.isFinite(numericValue)) return '₱0';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(numericValue);
};

const mapPackageRow = (row: any): ReviewPackage => ({
  id: row.id ?? row.slug ?? `${Date.now()}`,
  title: row.title ?? 'Untitled Package',
  targetAudience: row.subtitle ?? 'All learners',
  description: row.description ?? 'No description provided yet.',
  price: normalizeCurrency(row.price),
  period: row.period ?? 'Flexible access',
  popular: Boolean(row.is_popular),
  features: Array.isArray(row.features) ? row.features : [],
  totalModules: Number(row.total_modules ?? 0),
  mockExamsCount: Number(row.mock_exam_count ?? 0),
  category: (row.category as ReviewPackage['category']) ?? 'Specialized',
  status: row.status === 'draft' ? 'Draft' : row.status === 'archived' ? 'Archived' : 'Active',
  enrollmentCount: Number(row.enrollment_count ?? 0),
  scoringType: row.scoring_type === 'ielts-band' ? 'ielts-band' : 'percentage',
});

const mapLessonRow = (row: any): Lesson => ({
  id: row.id ?? `${Date.now()}`,
  title: row.title ?? 'Lesson',
  subject: row.subject ?? 'General Review',
  duration: row.duration ?? '45 mins',
  completed: Boolean(row.completed),
  progressPercent: Number(row.progress_percent ?? 0),
  instructor: row.instructor ?? 'ReviewHub Mentor',
  materialsCount: Number(row.materials_count ?? 0),
  nextQuizAvailable: Boolean(row.next_quiz_available),
  packageId: row.package_id ?? undefined,
  contentSummary: row.content_summary ?? undefined,
  keyTakeaways: Array.isArray(row.key_takeaways) ? row.key_takeaways : [],
});

const mapTransactionRow = (row: any): PaymentTransaction => ({
  id: row.id ?? `${Date.now()}`,
  studentId: row.profile_id ?? 'guest-user',
  studentName: row.profiles?.full_name ?? 'Student',
  studentEmail: row.profiles?.email ?? 'student@reviewhub.local',
  packageTitle: row.review_packages?.title ?? 'Package',
  amount: normalizeCurrency(row.amount),
  paymentMethod: (row.payment_method as PaymentTransaction['paymentMethod']) ?? 'GCash',
  referenceNumber: row.reference_number ?? 'N/A',
  status: (row.status === 'verified' ? 'Verified' : row.status === 'failed' ? 'Failed' : 'Pending') as PaymentTransaction['status'],
  date: row.created_at ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
});

export async function loadSiteData() {
  if (!supabase) {
    return {
      packages: fallbackPackages,
      lessons: fallbackLessons,
      transactions: [] as PaymentTransaction[],
    };
  }

  try {
    const [packagesResult, lessonsResult, transactionsResult] = await Promise.all([
      supabase.from('review_packages').select('*').order('created_at', { ascending: false }),
      supabase.from('lessons').select('*').order('created_at', { ascending: false }),
      supabase
        .from('payment_transactions')
        .select('*, profiles(full_name, email), review_packages(title)')
        .order('created_at', { ascending: false }),
    ]);

    const packages = packagesResult.data?.length
      ? packagesResult.data.map(mapPackageRow)
      : fallbackPackages;

    const lessons = lessonsResult.data?.length
      ? lessonsResult.data.map(mapLessonRow)
      : fallbackLessons;

    const transactions = transactionsResult.data?.length
      ? transactionsResult.data.map(mapTransactionRow)
      : [];

    return { packages, lessons, transactions };
  } catch (error) {
    console.warn('Supabase data load failed, falling back to mock data:', error);
    return {
      packages: fallbackPackages,
      lessons: fallbackLessons,
      transactions: [] as PaymentTransaction[],
    };
  }
}
