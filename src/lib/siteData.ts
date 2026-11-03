import type { Lesson, PaymentTransaction, ReviewPackage } from '../types';
import { fetchReviewPackages, fetchLessons } from './services/packagesLessons';
import { fetchPaymentTransactions } from './services/payments';

/**
 * Loads site data connecting only to the tables needed for packages, lessons, and transactions:
 * - Packages & lessons flow: public.review_packages, public.lessons, public.lesson_materials
 * - Transactions: public.payment_transactions
 */
export async function loadSiteData(): Promise<{
  packages: ReviewPackage[];
  lessons: Lesson[];
  transactions: PaymentTransaction[];
}> {
  const [packages, lessons, transactions] = await Promise.all([
    fetchReviewPackages(),
    fetchLessons(),
    fetchPaymentTransactions(),
  ]);

  return {
    packages,
    lessons,
    transactions,
  };
}
