import React, { useState } from 'react';
import { ActivePage, ReviewPackage, UserRole, PaymentTransaction } from '../types';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import {
  GraduationCap,
  CheckCircle2,
  CreditCard,
  QrCode,
  Building2,
  Tag,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Package,
  Calendar,
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';

interface StudentEnrollmentPageProps {
  onNavigate: (page: ActivePage) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  packages: ReviewPackage[];
  onEnrollComplete: (studentName: string, packageTitle: string, amount: string, paymentMethod: string, refNo: string) => void;
  initialPackageId?: string;
}

// ── Mock current enrollment data ───────────────────────────────
const MOCK_ENROLLMENTS = [
  {
    id: 'enr-001',
    packageTitle:    'PRC Licensure Comprehensive',
    category:        'Licensure',
    batch:           'Batch Alpha (Nov 2026 – Morning & Weekend)',
    enrollmentDate:  'Oct 12, 2026',
    expiryDate:      'May 31, 2027',
    totalModules:    68,
    mockExams:       5,
    progress:        74,
    paymentStatus:   'Paid' as 'Paid' | 'Unpaid',
    amount:          '₱7,999',
    paymentMethod:   'GCash',
    referenceNo:     'GCASH-998241029',
    paymentDate:     'Oct 12, 2026',
    status:          'Active' as 'Active' | 'Pending' | 'Expired',
  },
  {
    id: 'enr-002',
    packageTitle:    'IELTS Academic & General Training Masterclass',
    category:        'IELTS / Language',
    batch:           'Weekend Track 1',
    enrollmentDate:  'Oct 25, 2026',
    expiryDate:      'Mar 25, 2027',
    totalModules:    50,
    mockExams:       6,
    progress:        18,
    paymentStatus:   'Unpaid' as 'Paid' | 'Unpaid',
    amount:          '₱6,999',
    paymentMethod:   '',
    referenceNo:     '',
    paymentDate:     '',
    status:          'Pending' as 'Active' | 'Pending' | 'Expired',
  },
];

export const StudentEnrollmentPage: React.FC<StudentEnrollmentPageProps> = ({
  onNavigate,
  onShowToast,
  packages,
  onEnrollComplete,
  initialPackageId,
}) => {
  // 'overview' = My Enrollment summary; 'new' = multi-step wizard; 'pay' = inline payment
  const [view, setView] = useState<'overview' | 'new' | 'pay'>(
    initialPackageId ? 'new' : 'overview'
  );
  const [payingEnrollmentId, setPayingEnrollmentId] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState(MOCK_ENROLLMENTS);

  // ── Wizard step state ──────────────────────────────────────
  // Step: 1 = Student Account, 2 = Package Selection, 3 = Payment & Checkout, 4 = Confirmation
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [formData, setFormData] = useState({
    fullName: 'Alyssa Reyes',
    email: 'alyssa.reyes@univ.edu.ph',
    phone: '+63 917 849 2011',
    password: '••••••••••',
    targetExam: 'PRC Board Licensure',
    batchSchedule: 'Batch Alpha (Nov 2026 - Morning & Weekend)',
  });

  // Step 2: Selected Package
  const [selectedPkgId, setSelectedPkgId] = useState<string>(
    initialPackageId || packages[0]?.id || 'pkg-board-comprehensive'
  );
  const selectedPkg = packages.find((p) => p.id === selectedPkgId) || packages[0];

  // Step 3: Payment Method & Checkout
  const [paymentMethod, setPaymentMethod] = useState<'GCash' | 'Maya' | 'Credit/Debit Card' | 'Bank Transfer'>('GCash');
  const [voucherCode, setVoucherCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [cardDetails, setCardDetails] = useState({
    holder: 'Alyssa Reyes',
    number: '4111 2222 3333 4444',
    expiry: '08/28',
    cvv: '891',
  });
  const [referenceNumber, setReferenceNumber] = useState(`REF-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Discount calculation
  const rawPriceNum = parseInt(selectedPkg.price.replace(/[^\d]/g, ''), 10) || 7999;
  const discountAmount = Math.round((rawPriceNum * discountPercent) / 100);
  const finalPriceNum = rawPriceNum - discountAmount;
  const finalPriceFormatted = `₱${finalPriceNum.toLocaleString()}`;

  const handleApplyVoucher = () => {
    if (voucherCode.trim().toUpperCase() === 'MELIORA2026' || voucherCode.trim().toUpperCase() === 'REVIEW10') {
      setDiscountPercent(10);
      onShowToast('Voucher Applied!', '10% Meliora Early-Bird Discount credited to your tuition.', 'success');
    } else if (voucherCode.trim().toUpperCase() === 'IELTS15') {
      setDiscountPercent(15);
      onShowToast('Voucher Applied!', '15% IELTS Special Launch Discount credited.', 'success');
    } else {
      onShowToast('Invalid Voucher', 'Code not recognized or expired. Try "MELIORA2026".', 'error');
    }
  };

  const handleConfirmPayment = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setStep(4);
      onEnrollComplete(
        formData.fullName,
        selectedPkg.title,
        finalPriceFormatted,
        paymentMethod,
        referenceNumber
      );
      onShowToast(
        'Payment Verified & Enrolled!',
        `Welcome to ${selectedPkg.title}! Your learning dashboard is now fully unlocked.`,
        'success'
      );
    }, 900);
  };

  // ── Inline Pay Now handler ─────────────────────────────────
  const handlePayNow = (enrollmentId: string) => {
    setPayingEnrollmentId(enrollmentId);
    setView('pay');
  };

  const handleInlinePaymentComplete = () => {
    if (!payingEnrollmentId) return;
    setEnrollments((prev) =>
      prev.map((e) =>
        e.id === payingEnrollmentId
          ? { ...e, paymentStatus: 'Paid' as const, status: 'Active' as const, paymentDate: 'Nov 1, 2026', referenceNo: `REF-${Date.now()}` }
          : e
      )
    );
    const enr = enrollments.find((e) => e.id === payingEnrollmentId);
    if (enr) {
      onEnrollComplete('Alyssa Reyes', enr.packageTitle, enr.amount, 'GCash', `REF-${Date.now()}`);
      onShowToast('Payment Successful!', `${enr.packageTitle} is now fully active.`, 'success');
    }
    setPayingEnrollmentId(null);
    setView('overview');
  };

  const statusBadge = (status: 'Active' | 'Pending' | 'Expired') => {
    const map = {
      Active:  { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: 'bi-check-circle-fill' },
      Pending: { cls: 'bg-amber-50 text-amber-700 border-amber-200',       icon: 'bi-clock-fill' },
      Expired: { cls: 'bg-red-50 text-red-600 border-red-200',             icon: 'bi-x-circle-fill' },
    };
    const s = map[status];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${s.cls}`}>
        <i className={`${s.icon} text-xs`} aria-hidden="true" /> {status}
      </span>
    );
  };

  const paymentBadge = (paid: 'Paid' | 'Unpaid') => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
      paid === 'Paid'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-red-50 text-red-600 border-red-200'
    }`}>
      <i className={`${paid === 'Paid' ? 'bi-credit-card-fill' : 'bi-exclamation-triangle-fill'} text-xs`} aria-hidden="true" />
      {paid === 'Paid' ? 'Paid' : 'Unpaid'}
    </span>
  );

  // ══════════════════════════════════════════════════════════
  // VIEW: MY ENROLLMENT OVERVIEW
  // ══════════════════════════════════════════════════════════
  if (view === 'overview') {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Page header */}
        <div className="bg-white p-6 rounded-2xl border border-[#E1EFF7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#3498DB] mb-1">
              <i className="bi bi-clipboard-check" aria-hidden="true" />
              <span>Enrollment &amp; Payment Status</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#2C3E50]">My Enrollment</h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              View your enrolled courses, batch details, and payment status all in one place.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => { setStep(1); setView('new'); }}
          >
            <i className="bi bi-plus-lg mr-1.5" aria-hidden="true" />
            Enroll in New Package
          </Button>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Enrolled Courses',  value: enrollments.length,                                                  icon: 'bi-collection',                color: '#3498DB' },
            { label: 'Active',            value: enrollments.filter((e) => e.status === 'Active').length,             icon: 'bi-check-circle-fill',         color: '#10B981' },
            { label: 'Pending Payment',   value: enrollments.filter((e) => e.paymentStatus === 'Unpaid').length,      icon: 'bi-exclamation-triangle-fill', color: '#F59E0B' },
            { label: 'Avg. Progress',     value: `${Math.round(enrollments.reduce((s, e) => s + e.progress, 0) / enrollments.length)}%`, icon: 'bi-graph-up-arrow', color: '#7C3AED' },
          ].map((s) => (
            <div key={s.label} className="bg-white p-4 rounded-2xl border border-[#E1EFF7] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                   style={{ backgroundColor: s.color + '18' }}>
                <i className={`${s.icon} text-lg`} style={{ color: s.color }} aria-hidden="true" />
              </div>
              <div>
                <div className="text-xl font-extrabold font-mono text-[#2C3E50] leading-none">{s.value}</div>
                <div className="text-[11px] text-[#64748B] mt-0.5">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Enrollment cards */}
        <div className="space-y-5">
          {enrollments.map((enr) => (
            <div
              key={enr.id}
              className={`bg-white rounded-2xl border-2 p-6 shadow-xs ${
                enr.paymentStatus === 'Unpaid' ? 'border-amber-200' : enr.status === 'Active' ? 'border-[#E1EFF7]' : 'border-red-100'
              }`}
            >
              {/* Card header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#D6ECFA] flex items-center justify-center shrink-0">
                    <i className="bi bi-collection-fill text-[#3498DB] text-xl" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-[#3498DB] uppercase tracking-widest mb-0.5">{enr.category}</div>
                    <h3 className="text-base font-extrabold text-[#2C3E50] leading-tight">{enr.packageTitle}</h3>
                    <p className="text-xs text-[#64748B] mt-0.5 flex items-center gap-1.5">
                      <i className="bi bi-people text-[#94A3B8]" aria-hidden="true" /> {enr.batch}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                  {statusBadge(enr.status)}
                  {paymentBadge(enr.paymentStatus)}
                </div>
              </div>

              {/* Detail grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Enrolled On',  value: enr.enrollmentDate,         icon: 'bi-calendar-check' },
                  { label: 'Valid Until',  value: enr.expiryDate,             icon: 'bi-calendar-x' },
                  { label: 'Modules',      value: `${enr.totalModules} total`, icon: 'bi-journal-bookmark' },
                  { label: 'Mock Exams',   value: `${enr.mockExams} included`, icon: 'bi-file-earmark-ruled' },
                ].map((d) => (
                  <div key={d.label} className="p-3 rounded-xl bg-[#F4FAFD] border border-[#E1EFF7]">
                    <div className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-1 flex items-center gap-1">
                      <i className={`${d.icon} text-xs`} aria-hidden="true" /> {d.label}
                    </div>
                    <div className="text-xs font-bold text-[#2C3E50]">{d.value}</div>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="mb-5">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#2C3E50]">Course Progress</span>
                  <span className="font-bold font-mono text-[#3498DB]">{enr.progress}%</span>
                </div>
                <ProgressBar value={enr.progress} color={enr.progress >= 70 ? 'bg-emerald-500' : 'bg-[#3498DB]'} size="sm" />
              </div>

              {/* Payment row */}
              <div className={`rounded-xl p-4 border ${
                enr.paymentStatus === 'Paid' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className={`text-[11px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${
                      enr.paymentStatus === 'Paid' ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      <i className={`${enr.paymentStatus === 'Paid' ? 'bi-credit-card-fill' : 'bi-exclamation-triangle-fill'}`} aria-hidden="true" />
                      Payment Information
                    </div>
                    {enr.paymentStatus === 'Paid' ? (
                      <div className="space-y-0.5 text-xs text-emerald-800">
                        <div><span className="font-semibold">Amount Paid:</span> <span className="font-mono font-bold">{enr.amount}</span></div>
                        <div><span className="font-semibold">Method:</span> {enr.paymentMethod} &nbsp;·&nbsp; <span className="font-semibold">Ref:</span> <span className="font-mono">{enr.referenceNo}</span></div>
                        <div><span className="font-semibold">Payment Date:</span> {enr.paymentDate}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-amber-800 space-y-0.5">
                        <div className="font-bold">Amount Due: <span className="font-mono">{enr.amount}</span></div>
                        <div className="text-amber-700">Your slot is reserved. Pay now to unlock full course access.</div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {enr.paymentStatus === 'Paid' ? (
                      <Button variant="secondary" size="sm"
                        onClick={() => onShowToast('Receipt Downloaded', `Official OR for ${enr.packageTitle}`, 'success')}>
                        <i className="bi bi-download mr-1.5" aria-hidden="true" />Download Receipt
                      </Button>
                    ) : (
                      <Button variant="primary" size="md" onClick={() => handlePayNow(enr.id)}>
                        <i className="bi bi-credit-card-fill mr-1.5" aria-hidden="true" />
                        Pay Now — {enr.amount}
                      </Button>
                    )}
                    {enr.status === 'Active' && (
                      <Button variant="outline" size="sm" onClick={() => onNavigate('student-dashboard')}>
                        <i className="bi bi-box-arrow-in-right mr-1.5" aria-hidden="true" />Go to Course
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // VIEW: INLINE PAY NOW
  // ══════════════════════════════════════════════════════════
  if (view === 'pay') {
    const enr = enrollments.find((e) => e.id === payingEnrollmentId);
    if (!enr) { setView('overview'); return null; }
    return (
      <div className="max-w-2xl mx-auto pb-12 space-y-5">
        <button onClick={() => setView('overview')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#3498DB] transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" /> Back to My Enrollment
        </button>

        <div className="bg-white p-6 rounded-2xl border border-[#E1EFF7] shadow-xs">
          <h2 className="text-xl font-extrabold text-[#2C3E50] mb-1">Complete Your Payment</h2>
          <p className="text-sm text-[#64748B]">{enr.packageTitle} · <span className="font-bold text-[#2C3E50]">{enr.amount}</span></p>
        </div>

        <Card className="border-[#D6ECFA]">
          <CardBody className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#2C3E50] mb-2">Select Payment Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['GCash', 'Maya', 'Credit/Debit Card', 'Bank Transfer'] as const).map((m) => (
                  <button key={m} type="button"
                    className="p-3 rounded-xl border-2 text-xs font-bold border-[#3498DB] bg-[#EEF7FD] text-[#2980B9] flex flex-col items-center gap-1.5 cursor-pointer hover:bg-[#D6ECFA]">
                    <CreditCard className="w-5 h-5" />{m}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#F4FAFD] border border-[#D6ECFA] space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-[#2C3E50] rounded-xl flex items-center justify-center shrink-0">
                  <QrCode className="w-14 h-14 text-white" />
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-[#2C3E50]">Merchant: Meliora Learning Hub Inc.</p>
                  <p className="text-[#64748B]">Account: <span className="font-mono font-bold text-[#2C3E50]">0917-800-2490</span></p>
                  <p className="text-[#64748B]">Amount: <span className="font-mono font-bold text-[#2C3E50]">{enr.amount}</span></p>
                  <p className="text-emerald-600 font-semibold">✓ Instant verification after transfer</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#2C3E50] mb-1">Reference Number *</label>
                <input type="text" defaultValue={`GCASH-${Date.now()}`}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D6ECFA] bg-white font-mono"
                  placeholder="e.g. GCASH-889102482" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#F0F6FA]">
              <Button variant="secondary" size="md" onClick={() => setView('overview')}>Cancel</Button>
              <Button variant="primary" size="lg" onClick={handleInlinePaymentComplete}
                icon={<ShieldCheck className="w-5 h-5" />}>
                Confirm Payment — {enr.amount}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // VIEW: NEW ENROLLMENT WIZARD (existing multi-step flow)
  // ══════════════════════════════════════════════════════════
  return (
    <div className="max-w-4xl mx-auto py-6 pb-20 px-4 sm:px-6">
      {/* Back to overview */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setView('overview')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#3498DB] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Enrollment</span>
        </button>
        <span className="text-xs text-[#94A3B8] font-medium">Meliora Learning Hub Official Enrollment</span>
      </div>

      {/* Stepper Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E1EFF7] shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-[#2C3E50]">
              ReviewHub Student Enrollment & Checkout
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
              Secure your review slot, setup your study schedule, and complete tuition registration.
            </p>
          </div>
          <div className="shrink-0">
            <span className="text-xs font-mono font-bold text-[#3498DB] bg-[#D6ECFA]/50 px-3 py-1.5 rounded-xl border border-[#BCE0F7]">
              Step {step} of 4
            </span>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
          <div className={`p-2 rounded-xl transition-colors ${step >= 1 ? 'bg-[#3498DB] text-white' : 'bg-[#F4FAFD] text-[#64748B]'}`}>
            1. Student Account
          </div>
          <div className={`p-2 rounded-xl transition-colors ${step >= 2 ? 'bg-[#3498DB] text-white' : 'bg-[#F4FAFD] text-[#64748B]'}`}>
            2. Review Package
          </div>
          <div className={`p-2 rounded-xl transition-colors ${step >= 3 ? 'bg-[#3498DB] text-white' : 'bg-[#F4FAFD] text-[#64748B]'}`}>
            3. Tuition Payment
          </div>
          <div className={`p-2 rounded-xl transition-colors ${step === 4 ? 'bg-emerald-600 text-white' : 'bg-[#F4FAFD] text-[#64748B]'}`}>
            4. Access Unlocked
          </div>
        </div>
      </div>

      {/* STEP 1: STUDENT ACCOUNT & IDENTITY */}
      {step === 1 && (
        <Card className="border-[#D6ECFA]">
          <CardHeader
            title="Step 1: Student Information & Account Setup"
            subtitle="Enter your reviewee credentials so mentors can track your exam diagnostics"
            action={
              <button
                type="button"
                onClick={() => setIsExistingUser(!isExistingUser)}
                className="text-xs text-[#3498DB] font-semibold hover:underline cursor-pointer"
              >
                {isExistingUser ? 'Need to register as New Student?' : 'Already have a ReviewHub account? Sign In'}
              </button>
            }
          />
          <CardBody className="p-6 space-y-5">
            {isExistingUser ? (
              <div className="p-4 bg-[#F4FAFD] rounded-xl border border-[#D6ECFA] mb-4 text-xs text-[#2C3E50]">
                <p className="font-bold text-[#3498DB] mb-1">Existing Student Sign-In</p>
                <p className="text-[#64748B]">Sign in to add a new review package to your current learner profile.</p>
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2C3E50] mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Alyssa Reyes"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#D6ECFA] focus:outline-none focus:ring-2 focus:ring-[#3498DB] bg-[#FAFDFE]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3E50] mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alyssa.reyes@univ.edu.ph"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#D6ECFA] focus:outline-none focus:ring-2 focus:ring-[#3498DB] bg-[#FAFDFE]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2C3E50] mb-1">Mobile Contact Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+63 9XX XXX XXXX"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#D6ECFA] focus:outline-none focus:ring-2 focus:ring-[#3498DB] bg-[#FAFDFE]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3E50] mb-1">Account Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#D6ECFA] focus:outline-none focus:ring-2 focus:ring-[#3498DB] bg-[#FAFDFE]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#2C3E50] mb-1">Primary Target Examination</label>
                <select
                  value={formData.targetExam}
                  onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D6ECFA] focus:outline-none focus:ring-2 focus:ring-[#3498DB] bg-[#FAFDFE]"
                >
                  <option>PRC Licensure Examination</option>
                  <option>IELTS Academic / General Training (Target Band 7.5+)</option>
                  <option>College Entrance Examination (UPCAT/USTET/CET)</option>
                  <option>Civil Service Examination (Professional Eligibility)</option>
                  <option>Working Professional Review Certification</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3E50] mb-1">Preferred Batch Schedule</label>
                <select
                  value={formData.batchSchedule}
                  onChange={(e) => setFormData({ ...formData, batchSchedule: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D6ECFA] focus:outline-none focus:ring-2 focus:ring-[#3498DB] bg-[#FAFDFE]"
                >
                  <option>Batch Alpha (Nov 2026 - Morning & Weekend)</option>
                  <option>Batch Beta (Nov 2026 - Evening Working Student Track)</option>
                  <option>Batch Gamma (Dec 2026 - Intensive Fast-Track)</option>
                  <option>Self-Paced 24/7 Digital On-Demand</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end border-t border-[#F0F6FA]">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
                onClick={() => {
                  if (!formData.fullName || !formData.email) {
                    onShowToast('Required Information', 'Please fill in your name and email to continue.', 'error');
                    return;
                  }
                  setStep(2);
                }}
              >
                Proceed to Review Package Selection
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* STEP 2: REVIEW PACKAGE SELECTION */}
      {step === 2 && (
        <div className="space-y-6">
          <Card className="border-[#D6ECFA]">
            <CardHeader
              title="Step 2: Select Your Review Program"
              subtitle="Choose the curriculum and mock exam tier calibrated to your target test"
            />
            <CardBody className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.map((pkg) => {
                  const isSelected = selectedPkgId === pkg.id;
                  const isIelts = pkg.category === 'IELTS / Language' || pkg.scoringType === 'ielts-band';

                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPkgId(pkg.id)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#3498DB] bg-[#D6ECFA]/30 shadow-sm ring-2 ring-[#3498DB]/15'
                          : 'border-[#E1EFF7] bg-white hover:border-[#5DADE2]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold text-[#3498DB] uppercase tracking-wide">
                            {pkg.category}
                          </span>
                          {isIelts && (
                            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Official IELTS Band 1.0 - 9.0 Scoring
                            </span>
                          )}
                          {pkg.popular && !isIelts && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Most Popular
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-[#2C3E50]">{pkg.title}</h3>
                        <p className="text-xs text-[#64748B] mt-1 mb-3 line-clamp-2">{pkg.targetAudience}</p>

                        <div className="py-2 border-y border-[#F0F6FA] mb-3 flex items-baseline justify-between">
                          <span className="text-2xl font-extrabold font-mono text-[#2C3E50]">
                            {pkg.price}
                          </span>
                          <span className="text-xs text-[#64748B]">/ {pkg.period}</span>
                        </div>

                        <ul className="text-xs space-y-1.5 text-[#2C3E50] mb-4">
                          {(pkg.features || []).slice(0, 3).map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5 truncate">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#3498DB] shrink-0 mt-0.5" />
                              <span className="truncate">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-[#64748B] font-mono">
                          {pkg.totalModules} Modules · {pkg.mockExamsCount} Mock Exams
                        </span>
                        <span
                          className={`font-bold ${
                            isSelected ? 'text-[#2980B9]' : 'text-[#94A3B8]'
                          }`}
                        >
                          {isSelected ? '✓ Selected' : 'Select'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-[#F0F6FA]">
                <Button
                  variant="secondary"
                  size="md"
                  icon={<ArrowLeft className="w-4 h-4" />}
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  onClick={() => setStep(3)}
                >
                  Proceed to Tuition Payment ({selectedPkg.price})
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* STEP 3: TUITION PAYMENT & CHECKOUT */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Payment Method Selection */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-[#D6ECFA]">
              <CardHeader
                title="Step 3: Select Payment Gateway"
                subtitle="All transactions encrypted and verified with Meliora Bursar Office"
              />
              <CardBody className="p-6 space-y-5">
                {/* Payment Method Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('GCash')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'GCash'
                        ? 'border-[#3498DB] bg-[#3498DB] text-white shadow-xs'
                        : 'border-[#D6ECFA] bg-white text-[#2C3E50] hover:bg-[#F4FAFD]'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span>GCash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Maya')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'Maya'
                        ? 'border-[#3498DB] bg-[#3498DB] text-white shadow-xs'
                        : 'border-[#D6ECFA] bg-white text-[#2C3E50] hover:bg-[#F4FAFD]'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span>Maya</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Credit/Debit Card')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'Credit/Debit Card'
                        ? 'border-[#3498DB] bg-[#3498DB] text-white shadow-xs'
                        : 'border-[#D6ECFA] bg-white text-[#2C3E50] hover:bg-[#F4FAFD]'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Credit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Bank Transfer')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      paymentMethod === 'Bank Transfer'
                        ? 'border-[#3498DB] bg-[#3498DB] text-white shadow-xs'
                        : 'border-[#D6ECFA] bg-white text-[#2C3E50] hover:bg-[#F4FAFD]'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span>Bank Transfer</span>
                  </button>
                </div>

                {/* Sub-form based on selected payment method */}
                {(paymentMethod === 'GCash' || paymentMethod === 'Maya') && (
                  <div className="p-5 rounded-2xl bg-[#F4FAFD] border border-[#D6ECFA] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-[#2C3E50]">
                        Scan QR Code or Use Direct e-Wallet Number
                      </div>
                      <span className="text-[10px] font-mono text-[#3498DB] bg-white px-2 py-0.5 rounded border border-[#D6ECFA]">
                        Instant Verification
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-5 bg-white p-4 rounded-xl border border-[#E1EFF7]">
                      <div className="w-28 h-28 bg-[#2C3E50] rounded-xl p-2 flex flex-col items-center justify-center text-white shrink-0">
                        <QrCode className="w-16 h-16" />
                        <span className="text-[9px] font-mono mt-1">{paymentMethod} PAY</span>
                      </div>

                      <div className="space-y-1 text-xs text-[#2C3E50]">
                        <p className="font-bold">Merchant: Meliora Learning Hub Inc.</p>
                        <p className="text-[#64748B]">Account No: <strong className="text-[#2C3E50] font-mono">0917-800-2490</strong></p>
                        <p className="text-[#64748B]">Payable Amount: <strong className="text-[#2C3E50] font-mono font-bold">{finalPriceFormatted}</strong></p>
                        <p className="text-[11px] text-emerald-600 font-semibold pt-1">
                          ✓ Automated webhook detects transaction within 15 seconds.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2C3E50] mb-1">
                        Transaction Reference Number *
                      </label>
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        placeholder="e.g. GCASH-889102482"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D6ECFA] bg-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'Credit/Debit Card' && (
                  <div className="p-5 rounded-2xl bg-[#F4FAFD] border border-[#D6ECFA] space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2C3E50] mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardDetails.holder}
                        onChange={(e) => setCardDetails({ ...cardDetails, holder: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D6ECFA] bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#2C3E50] mb-1">
                        Card Number (Visa / Mastercard / JCB)
                      </label>
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D6ECFA] bg-white font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#2C3E50] mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          placeholder="MM/YY"
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D6ECFA] bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#2C3E50] mb-1">CVV / CVC</label>
                        <input
                          type="password"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D6ECFA] bg-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Bank Transfer' && (
                  <div className="p-5 rounded-2xl bg-[#F4FAFD] border border-[#D6ECFA] space-y-3 text-xs">
                    <p className="font-bold text-[#2C3E50]">Official Bank Deposit Accounts:</p>
                    <div className="space-y-2 bg-white p-3.5 rounded-xl border border-[#E1EFF7]">
                      <div>
                        <strong className="text-[#3498DB]">Bank of the Philippine Islands (BPI):</strong>
                        <p className="font-mono text-[#2C3E50]">Acc No: 4921-0842-19 · Meliora Learning Hub Inc.</p>
                      </div>
                      <div>
                        <strong className="text-[#3498DB]">BDO Unibank (BDO):</strong>
                        <p className="font-mono text-[#2C3E50]">Acc No: 0012-9984-7721 · Meliora Learning Hub Inc.</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#2C3E50] mb-1">Deposit Reference Code</label>
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D6ECFA] bg-white font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Voucher Code Box */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-[#2C3E50] mb-1">
                    Have an Early-Bird or Referral Voucher?
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                      <input
                        type="text"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        placeholder="Try 'MELIORA2026' or 'IELTS15'..."
                        className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-[#D6ECFA] bg-[#FAFDFE] font-mono uppercase"
                      />
                    </div>
                    <Button variant="secondary" size="sm" onClick={handleApplyVoucher}>
                      Apply Code
                    </Button>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between border-t border-[#F0F6FA]">
                  <Button variant="secondary" size="md" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    disabled={isProcessingPayment}
                    icon={<ShieldCheck className="w-5 h-5" />}
                    onClick={handleConfirmPayment}
                  >
                    {isProcessingPayment ? 'Authorizing Payment...' : `Complete Payment (${finalPriceFormatted})`}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right: Order Summary Card */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-[#D6ECFA] sticky top-24">
              <CardHeader title="Order & Enrollment Summary" />
              <CardBody className="p-5 space-y-4 text-xs">
                <div>
                  <div className="text-[11px] font-bold text-[#3498DB] uppercase">Enrolled Candidate:</div>
                  <div className="font-bold text-[#2C3E50] text-sm">{formData.fullName}</div>
                  <div className="text-[#64748B]">{formData.email}</div>
                  <div className="text-[#64748B]">{formData.batchSchedule}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAFDFE] border border-[#E1EFF7] space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-[#2C3E50]">{selectedPkg.title}</div>
                      <div className="text-[#64748B]">{selectedPkg.period}</div>
                    </div>
                    <span className="font-mono font-bold text-[#2C3E50]">{selectedPkg.price}</span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex items-center justify-between text-emerald-600 font-semibold pt-1 border-t border-[#F0F6FA]">
                      <span>Meliora Early Bird Voucher ({discountPercent}%)</span>
                      <span className="font-mono">-₱{discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm font-extrabold text-[#2C3E50] pt-2 border-t border-[#E1EFF7]">
                    <span>Total Amount Due:</span>
                    <span className="font-mono text-lg text-[#3498DB]">{finalPriceFormatted}</span>
                  </div>
                </div>

                <div className="p-3 bg-[#F4FAFD] rounded-xl border border-[#D6ECFA] space-y-1.5 text-[11px] text-[#64748B]">
                  <div className="flex items-center gap-1.5 text-[#2C3E50] font-semibold">
                    <ShieldCheck className="w-4 h-4 text-[#3498DB]" />
                    <span>Included Reviewer Privileges:</span>
                  </div>
                  <p>• {selectedPkg.totalModules} full syllabus modules & recorded videos</p>
                  <p>• {selectedPkg.mockExamsCount} full diagnostic mock exams with rationale</p>
                  <p>• 24/7 AI Reviewer summarizer & formula digests</p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* STEP 4: CONFIRMATION & ACCESS UNLOCKED */}
      {step === 4 && (
        <Card className="border-emerald-200 bg-gradient-to-b from-white to-emerald-50/20 text-center p-8 max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Enrollment Confirmed & Verified
          </span>
          <h2 className="text-3xl font-extrabold text-[#2C3E50] mt-1 mb-2">
            Welcome to ReviewHub, {formData.fullName}!
          </h2>
          <p className="text-sm text-[#64748B] max-w-md mx-auto mb-6">
            Your tuition payment of <strong className="text-[#2C3E50] font-mono">{finalPriceFormatted}</strong> via {paymentMethod} was successfully recorded.
          </p>

          <div className="p-4 rounded-xl bg-white border border-emerald-200 max-w-md mx-auto text-left text-xs space-y-2 mb-6">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Program:</span>
              <span className="font-bold text-[#2C3E50]">{selectedPkg.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Schedule:</span>
              <span className="font-semibold text-[#2C3E50]">{formData.batchSchedule}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Receipt Reference:</span>
              <span className="font-mono font-bold text-[#3498DB]">{referenceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Payment Status:</span>
              <span className="font-bold text-emerald-600">Official Receipt Verified</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              icon={<Sparkles className="w-5 h-5" />}
              onClick={() => onNavigate('student-dashboard')}
            >
              Enter Student Space & Start Learning
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={<Download className="w-4 h-4" />}
              onClick={() => onShowToast('Official Receipt Downloaded', 'PDF receipt saved to downloads.', 'info')}
            >
              Download Official Receipt
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
