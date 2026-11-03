import { supabase } from '../supabase';
import type { Lesson, ReviewPackage } from '../../types';

export const DEFAULT_PACKAGES: ReviewPackage[] = [
  {
    id: 'prc-licensure-comprehensive',
    title: 'PRC Licensure Comprehensive',
    targetAudience: 'For graduating seniors & degree holders taking licensure exams',
    description: 'Complete high-yield review curriculum covering core theory, diagnostic simulations, and rationalized drill banks.',
    price: '₱7,999',
    period: '6-Month Access',
    popular: true,
    features: [
      'Full syllabus modular video lectures',
      'AI-powered adaptive study plan',
      '5 full-length diagnostic mock exams',
      'Unlimited AI Reviewer material summarizer',
      'Downloadable high-yield summaries & formula cards',
      'Weekly live Q&A consultation clinics',
    ],
    totalModules: 68,
    mockExamsCount: 5,
    category: 'Licensure',
  },
  {
    id: 'college-entrance-intensive',
    title: 'College Entrance Exam (CET) Intensive',
    targetAudience: 'For Grade 11 & 12 students aiming for top universities',
    description: 'Targeted preparation for UPCAT, USTET, DLSU-CET, ACET, and state university entrance examinations.',
    price: '₱4,999',
    period: '4-Month Access',
    popular: false,
    features: [
      'Math, Science, English, & Abstract Reasoning drills',
      'Time-pressure speed test simulator',
      'Detailed rationale for every question',
      'AI Flashcards generator for vocabulary & formulas',
      'Essay writing feedback guide',
    ],
    totalModules: 42,
    mockExamsCount: 4,
    category: 'College Entrance',
  },
  {
    id: 'civil-service-pass',
    title: 'Civil Service Examination Pass',
    targetAudience: 'For career professionals seeking government eligibility',
    description: 'Comprehensive preparation for Professional & Sub-Professional levels covering numerical, analytical, and clerical topics.',
    price: '₱3,499',
    period: '3-Month Access',
    popular: false,
    features: [
      'Philippine Constitution & Code of Ethics modules',
      'Numerical ability shortcuts & word problems',
      'Verbal ability and paragraph organization drills',
      '3 full official-format simulated tests',
      'Progress tracking & weakness diagnostics',
    ],
    totalModules: 36,
    mockExamsCount: 3,
    category: 'Civil Service',
  },
  {
    id: 'ielts-masterclass',
    title: 'IELTS Academic & General Training Masterclass',
    targetAudience: 'For healthcare professionals, nurses, and students targeting Band 7.5+ for UK, Canada, Australia, and US migration',
    description: 'Intensive band-boosting curriculum covering Listening, Academic Reading, Writing Task 1 & 2 criteria, and 1-on-1 speaking interview simulations with AI voice analysis.',
    price: '₱6,999',
    period: '5-Month Access',
    popular: true,
    features: [
      'Official IELTS Band 1.0 to 9.0 diagnostic mock scoring',
      'AI automated essay grading for Cohesion, Lexical Resource & Grammar',
      'Speaking accent & fluency evaluation engine',
      '6 full-length timed IELTS academic exam batteries',
      'Band 8.0+ model answer banks and vocabulary lists',
    ],
    totalModules: 50,
    mockExamsCount: 6,
    category: 'IELTS / Language',
    scoringType: 'ielts-band',
  },
];

export const DEFAULT_LESSONS: Lesson[] = [
  {
    id: 'les-1',
    title: 'Core Principles of Thermodynamics & Energy Transfer',
    subject: 'General Engineering Sciences',
    duration: '45 mins',
    completed: true,
    progressPercent: 100,
    instructor: 'Engr. Marco Santos, M.Sc.',
    materialsCount: 4,
    nextQuizAvailable: true,
    contentSummary: 'Energy transfer and system laws',
    keyTakeaways: ['Entropy', 'Heat transfer', 'System efficiency'],
  },
  {
    id: 'les-2',
    title: 'Constitutional Law, General Principles & Bill of Rights',
    subject: 'Professional Ethics & Law',
    duration: '60 mins',
    completed: true,
    progressPercent: 100,
    instructor: 'Atty. Cristina Valderrama',
    materialsCount: 6,
    nextQuizAvailable: true,
    contentSummary: 'Foundations of constitutional rights',
    keyTakeaways: ['Due process', 'Equal protection', 'Bill of Rights'],
  },
  {
    id: 'les-3',
    title: 'Fluid Mechanics: Laminar and Turbulent Flow in Pipes',
    subject: 'Applied Physical Sciences',
    duration: '50 mins',
    completed: false,
    progressPercent: 65,
    instructor: 'Dr. Ramon Delgado',
    materialsCount: 5,
    nextQuizAvailable: true,
    contentSummary: 'Flow regimes and pressure losses',
    keyTakeaways: ['Laminar flow', 'Reynolds number', 'Head loss'],
  },
  {
    id: 'les-4',
    title: 'Quantitative Data Analysis & Probability Distributions',
    subject: 'Applied Mathematics',
    duration: '55 mins',
    completed: false,
    progressPercent: 20,
    instructor: 'Prof. Helen Ramirez',
    materialsCount: 3,
    nextQuizAvailable: false,
    contentSummary: 'Statistics and probability review',
    keyTakeaways: ['Mean', 'Variance', 'Probability'],
  },
  {
    id: 'les-5',
    title: 'Ethics and Public Service Standards',
    subject: 'Civil Service Review',
    duration: '40 mins',
    completed: false,
    progressPercent: 0,
    instructor: 'Dr. Maria Solis',
    materialsCount: 2,
    nextQuizAvailable: false,
    contentSummary: 'Ethics in government work',
    keyTakeaways: ['Integrity', 'Transparency', 'Accountability'],
  },
];

function mapDbPackageToReviewPackage(row: any): ReviewPackage {
  return {
    id: row.slug || row.id,
    title: row.title,
    targetAudience: row.subtitle || '',
    description: row.description || '',
    price: typeof row.price === 'number' ? `₱${row.price.toLocaleString()}` : String(row.price || '₱0'),
    period: row.period || '6-Month Access',
    popular: Boolean(row.is_popular),
    features: Array.isArray(row.features) ? row.features : [],
    totalModules: row.total_modules || 0,
    mockExamsCount: row.mock_exam_count || 0,
    category: row.category || 'Licensure',
  };
}

/**
 * Connects exclusively to:
 * - public.review_packages
 * Auto-seeds starter packages only if the table currently has no rows.
 */
export async function fetchReviewPackages(): Promise<ReviewPackage[]> {
  if (!supabase) {
    return DEFAULT_PACKAGES;
  }

  try {
    const { data, error } = await supabase
      .from('review_packages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Error reading review_packages:', error.message);
      return DEFAULT_PACKAGES;
    }

    // Only if the table currently has no rows, seed the starter packages
    if (!data || data.length === 0) {
      try {
        const rowsToSeed = DEFAULT_PACKAGES.map((pkg) => ({
          slug: pkg.id,
          title: pkg.title,
          subtitle: pkg.targetAudience,
          description: pkg.description,
          price: Number(String(pkg.price).replace(/[^0-9.]/g, '')) || 0,
          period: pkg.period,
          category: pkg.category,
          is_popular: Boolean(pkg.popular),
          total_modules: pkg.totalModules,
          mock_exam_count: pkg.mockExamsCount,
          features: pkg.features || [],
          status: 'active',
        }));

        const { data: inserted, error: insertError } = await supabase
          .from('review_packages')
          .insert(rowsToSeed)
          .select('*');

        if (!insertError && inserted && inserted.length > 0) {
          return inserted.map(mapDbPackageToReviewPackage);
        }
      } catch (seedErr) {
        console.warn('Could not auto-seed review_packages:', seedErr);
      }
      return DEFAULT_PACKAGES;
    }

    return data.map(mapDbPackageToReviewPackage);
  } catch (err) {
    console.warn('fetchReviewPackages error:', err);
    return DEFAULT_PACKAGES;
  }
}

/**
 * Connects exclusively to:
 * - public.lessons
 * - public.lesson_materials
 */
export async function fetchLessons(packageId?: string): Promise<Lesson[]> {
  if (!supabase) {
    return DEFAULT_LESSONS;
  }

  try {
    let query = supabase
      .from('lessons')
      .select('*, lesson_materials(id, title, file_name, object_path, mime_type, file_size)')
      .order('created_at', { ascending: true });

    if (packageId) {
      query = query.eq('package_id', packageId);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return DEFAULT_LESSONS;
    }

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      subject: row.subject,
      duration: row.duration,
      completed: Boolean(row.completed),
      progressPercent: row.progress_percent ?? 0,
      instructor: row.instructor || 'Faculty Member',
      materialsCount: (row.lesson_materials?.length || row.materials_count) ?? 0,
      nextQuizAvailable: Boolean(row.next_quiz_available),
      contentSummary: row.content_summary,
      keyTakeaways: row.key_takeaways || [],
      materials: (row.lesson_materials ?? []).map((m: any) => ({
        id: m.id,
        title: m.title,
        fileName: m.file_name,
        objectPath: m.object_path,
        mimeType: m.mime_type,
        fileSize: m.file_size,
      })),
    }));
  } catch (err) {
    console.warn('fetchLessons error:', err);
    return DEFAULT_LESSONS;
  }
}

/**
 * Connects exclusively to:
 * - public.lesson_materials
 */
export async function fetchLessonMaterials(lessonId: string) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('lesson_materials')
    .select('*')
    .eq('lesson_id', lessonId);

  if (error || !data) return [];
  return data;
}

/**
 * Connects exclusively to:
 * - public.enrollments
 */
export async function fetchEnrollments(profileId?: string) {
  if (!supabase) return [];
  let query = supabase.from('enrollments').select('*, review_packages(title, slug, price)');
  if (profileId) {
    query = query.eq('profile_id', profileId);
  }
  const { data, error } = await query;
  if (error || !data) return [];
  return data;
}

/**
 * Connects exclusively to:
 * - public.certificates
 */
export async function fetchCertificates(profileId?: string) {
  if (!supabase) return [];
  let query = supabase.from('certificates').select('*, review_packages(title)');
  if (profileId) {
    query = query.eq('profile_id', profileId);
  }
  const { data, error } = await query;
  if (error || !data) return [];
  return data;
}
