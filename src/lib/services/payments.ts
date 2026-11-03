import { supabase } from '../supabase';
import type { PaymentTransaction } from '../../types';

/**
 * Connects exclusively to:
 * - public.payment_transactions
 */

export async function fetchPaymentTransactions(profileId?: string): Promise<PaymentTransaction[]> {
  if (!supabase) return [];

  let query = supabase
    .from('payment_transactions')
    .select('*, profiles(full_name, email), review_packages(title)')
    .order('created_at', { ascending: false });

  if (profileId) {
    query = query.eq('profile_id', profileId);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    studentId: row.profile_id?.slice(0, 8) || 'MH-STUDENT',
    studentName: row.profiles?.full_name || 'Student Candidate',
    studentEmail: row.profiles?.email || '',
    packageTitle: row.review_packages?.title || 'Review Program',
    amount: typeof row.amount === 'number' ? `₱${row.amount.toLocaleString()}` : String(row.amount || '₱0'),
    paymentMethod: row.payment_method || 'GCash',
    referenceNumber: row.reference_number,
    status: row.status === 'verified' ? 'Verified' : 'Pending',
    date: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }));
}

export async function createPaymentTransaction(payload: {
  profileId: string;
  packageId?: string | null;
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
}): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase.from('payment_transactions').insert([
    {
      profile_id: payload.profileId,
      package_id: payload.packageId || null,
      amount: payload.amount,
      payment_method: payload.paymentMethod,
      reference_number: payload.referenceNumber,
      status: 'pending',
    },
  ]);

  if (error) {
    console.warn('createPaymentTransaction error:', error.message);
    return false;
  }
  return true;
}
