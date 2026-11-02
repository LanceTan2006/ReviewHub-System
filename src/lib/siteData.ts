import type { Lesson, PaymentTransaction, ReviewPackage } from '../types';

export async function loadSiteData() {
  return {
    packages: [] as ReviewPackage[],
    lessons: [] as Lesson[],
    transactions: [] as PaymentTransaction[],
  };
}
