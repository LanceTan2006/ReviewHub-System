import React, { useState, useEffect } from 'react';
import { ActivePage, EnrolledStudentRecord, ReviewPackage, Lesson, PaymentTransaction } from '../types';
import {
  sampleEnrolledStudents,
  reviewPackages as defaultPackages,
  sampleLessons as defaultLessons,
  samplePaymentTransactions as defaultTransactions
} from '../data/mockData';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { Modal } from '../components/Modal';
import {
  Users,
  Package,
  CreditCard,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Download,
  CheckCircle2,
  Calendar,
  BarChart3,
  UserPlus,
  Sparkles,
  BookOpen,
  Trash2,
  Copy,
  Edit3,
  Layers,
  FileCheck2,
  Check,
  Star,
  ExternalLink,
  ChevronRight,
  Globe,
  Play,
  Clock,
  QrCode,
  FileText
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (page: ActivePage) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  currentPage?: ActivePage;
  packages?: ReviewPackage[];
  onAddPackage?: (pkg: ReviewPackage) => void;
  onUpdatePackage?: (pkg: ReviewPackage) => void;
  onDeletePackage?: (id: string) => void;
  lessons?: Lesson[];
  onAddLesson?: (lesson: Lesson) => void;
  transactions?: PaymentTransaction[];
  onVerifyPaymentTransaction?: (id: string) => void;
  /** Which tabs to show. Defaults to all four. Use to restrict per role. */
  visibleTabs?: Array<'roster' | 'packages' | 'lessons' | 'payments'>;
  /** Label override for the page heading */
  pageTitle?: string;
  pageSubtitle?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigate,
  onShowToast,
  currentPage = 'admin-dashboard',
  packages: propPackages,
  onAddPackage,
  onUpdatePackage,
  onDeletePackage,
  lessons: propLessons,
  onAddLesson,
  transactions: propTransactions,
  onVerifyPaymentTransaction,
  visibleTabs,
  pageTitle,
  pageSubtitle,
}) => {
  const ALL_TABS: Array<'roster' | 'packages' | 'lessons' | 'payments'> = ['roster', 'packages', 'lessons', 'payments'];
  const allowedTabs = visibleTabs ?? ALL_TABS;
  // Local state fallbacks
  const [localPackages, setLocalPackages] = useState<ReviewPackage[]>(defaultPackages);
  const packagesList = propPackages || localPackages;

  const [localLessons, setLocalLessons] = useState<Lesson[]>(defaultLessons);
  const lessonsList = propLessons || localLessons;

  const [localTransactions, setLocalTransactions] = useState<PaymentTransaction[]>(defaultTransactions);
  const transactionsList = propTransactions || localTransactions;

  // Active view tab — default to first allowed tab
  const defaultTab: 'roster' | 'packages' | 'lessons' | 'payments' =
    currentPage === 'admin-packages' && allowedTabs.includes('packages') ? 'packages' :
    currentPage === 'admin-lessons'  && allowedTabs.includes('lessons')  ? 'lessons'  :
    currentPage === 'admin-payments' && allowedTabs.includes('payments') ? 'payments' :
    (allowedTabs[0] ?? 'roster');

  const [activeAdminTab, setActiveAdminTab] = useState<'roster' | 'packages' | 'lessons' | 'payments'>(defaultTab);

  useEffect(() => {
    if (currentPage === 'admin-packages' && allowedTabs.includes('packages')) setActiveAdminTab('packages');
    if (currentPage === 'admin-lessons'  && allowedTabs.includes('lessons'))  setActiveAdminTab('lessons');
    if (currentPage === 'admin-payments' && allowedTabs.includes('payments')) setActiveAdminTab('payments');
  }, [currentPage]);

  // Students roster state
  const [students, setStudents] = useState<EnrolledStudentRecord[]>(sampleEnrolledStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
  const [packageFilter, setPackageFilter] = useState<string>('All');

  // Modals state
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<EnrolledStudentRecord | null>(null);

  // New Student Form State
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    packageTitle: 'PRC Licensure Comprehensive',
    batch: 'Batch Alpha (Nov 2026)',
    paymentStatus: 'Paid' as 'Paid' | 'Pending',
    amount: '₱7,999',
  });

  // Package Development Form State
  const initialPackageForm: {
    title: string;
    targetAudience: string;
    description: string;
    price: string;
    period: string;
    category: 'Licensure' | 'College Entrance' | 'Civil Service' | 'IELTS / Language' | 'Specialized';
    totalModules: number;
    mockExamsCount: number;
    popular: boolean;
    scoringType: 'percentage' | 'ielts-band';
    features: string[];
    newFeatureText: string;
    status: 'Active' | 'Draft';
  } = {
    title: '',
    targetAudience: '',
    description: '',
    price: '₱6,999',
    period: '6-Month Access',
    category: 'Licensure',
    totalModules: 45,
    mockExamsCount: 4,
    popular: false,
    scoringType: 'percentage',
    features: [
      'Full syllabus modular video lectures',
      'AI-powered adaptive study plan & summary digests',
      'High-yield rationalized question drill bank',
      'Full diagnostic mock examination simulations'
    ],
    newFeatureText: '',
    status: 'Active',
  };

  const [packageForm, setPackageForm] = useState(initialPackageForm);

  // Generate Lesson Form State
  const initialLessonForm = {
    title: 'IELTS Academic Writing: Task 2 Advanced Cohesion & Paragraph Structuring',
    subject: 'IELTS Academic Writing',
    packageTitle: 'IELTS Academic & General Training Masterclass',
    instructor: 'Coach Sarah Jenkins, CELTA',
    duration: '45 mins',
    materialsCount: 4,
    nextQuizAvailable: true,
    contentSummary: 'Master formal discourse markers, complex sentence variety, and cohesion techniques required for Band 7.5+ in Task 2.',
    keyTakeaways: [
      'Use formal transitions (Nonetheless, Paradoxically, Henceforth) rather than colloquial linkers.',
      'Maintain clear thematic paragraph progression with one central topic per body paragraph.',
      'Vary subordinate and relative clauses to score Band 8.0+ in Grammatical Range.'
    ],
    isAiGenerating: false,
  };

  // PDF attachment state for lesson modal
  const [lessonPdfFiles, setLessonPdfFiles] = useState<File[]>([]);

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const pdfs = files.filter((f) => f.type === 'application/pdf');
    if (pdfs.length !== files.length) {
      onShowToast('Only PDF Files Allowed', 'Please select only .pdf files.', 'error');
    }
    setLessonPdfFiles((prev) => {
      // Deduplicate by name
      const existingNames = new Set(prev.map((f) => f.name));
      const newUnique = pdfs.filter((f) => !existingNames.has(f.name));
      return [...prev, ...newUnique];
    });
    // Reset the input so the same file can be re-selected after removal
    e.target.value = '';
  };

  const handleRemovePdf = (fileName: string) => {
    setLessonPdfFiles((prev) => prev.filter((f) => f.name !== fileName));
  };

  const [lessonForm, setLessonForm] = useState(initialLessonForm);

  // Filter students
  const filteredStudents = students.filter((stu) => {
    const matchesSearch =
      stu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stu.studentId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || stu.paymentStatus === statusFilter;
    const matchesPackage = packageFilter === 'All' || stu.packageTitle.includes(packageFilter);

    return matchesSearch && matchesStatus && matchesPackage;
  });

  // Filter packages in packages management tab
  const [packageSearch, setPackageSearch] = useState('');
  const [packageCategoryFilter, setPackageCategoryFilter] = useState<string>('All');

  const filteredPackages = packagesList.filter((pkg) => {
    const matchesSearch =
      pkg.title.toLowerCase().includes(packageSearch.toLowerCase()) ||
      pkg.targetAudience.toLowerCase().includes(packageSearch.toLowerCase()) ||
      pkg.description.toLowerCase().includes(packageSearch.toLowerCase());
    const matchesCat = packageCategoryFilter === 'All' || pkg.category === packageCategoryFilter;
    return matchesSearch && matchesCat;
  });

  // Filter lessons
  const [lessonSearch, setLessonSearch] = useState('');
  const filteredLessons = lessonsList.filter((l) =>
    l.title.toLowerCase().includes(lessonSearch.toLowerCase()) ||
    l.subject.toLowerCase().includes(lessonSearch.toLowerCase()) ||
    l.instructor.toLowerCase().includes(lessonSearch.toLowerCase())
  );

  // Handlers for Student Enrollment
  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.email) return;

    const record: EnrolledStudentRecord = {
      id: `stu-${Date.now()}`,
      studentId: `MH-2026-08${Math.floor(50 + Math.random() * 40)}`,
      name: newStudent.name,
      email: newStudent.email,
      packageTitle: newStudent.packageTitle,
      batch: newStudent.batch,
      enrollmentDate: 'Oct 27, 2026',
      paymentStatus: newStudent.paymentStatus,
      amount: newStudent.amount,
      academicProgress: 0,
    };

    setStudents([record, ...students]);
    setIsEnrollModalOpen(false);
    onShowToast('Student Enrolled Successfully', `${record.name} added to ${record.packageTitle}`, 'success');
  };

  const handleVerifyPayment = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, paymentStatus: 'Paid' } : s))
    );
    onShowToast('Payment Verified', 'Official tuition receipt logged in ledger.', 'success');
  };

  // Handlers for Package Development
  const handleOpenDevelopPackage = (pkgToEdit?: ReviewPackage) => {
    if (pkgToEdit) {
      setEditingPackageId(pkgToEdit.id);
      setPackageForm({
        title: pkgToEdit.title,
        targetAudience: pkgToEdit.targetAudience,
        description: pkgToEdit.description,
        price: pkgToEdit.price,
        period: pkgToEdit.period,
        category: pkgToEdit.category,
        totalModules: pkgToEdit.totalModules,
        mockExamsCount: pkgToEdit.mockExamsCount,
        popular: !!pkgToEdit.popular,
        scoringType: pkgToEdit.scoringType || 'percentage',
        features: [...pkgToEdit.features],
        newFeatureText: '',
        status: (pkgToEdit.status as 'Active' | 'Draft') || 'Active',
      });
    } else {
      setEditingPackageId(null);
      setPackageForm(initialPackageForm);
    }
    setIsPackageModalOpen(true);
  };

  const handlePackageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageForm.title.trim()) return;

    const newPkg: ReviewPackage = {
      id: editingPackageId || `pkg-${Date.now()}`,
      title: packageForm.title,
      targetAudience: packageForm.targetAudience,
      description: packageForm.description,
      price: packageForm.price,
      period: packageForm.period,
      category: packageForm.category,
      totalModules: Number(packageForm.totalModules),
      mockExamsCount: Number(packageForm.mockExamsCount),
      popular: packageForm.popular,
      scoringType: packageForm.scoringType,
      features: packageForm.features,
      status: packageForm.status,
      enrollmentCount: 0,
    };

    if (editingPackageId) {
      if (onUpdatePackage) onUpdatePackage(newPkg);
      else setLocalPackages((prev) => prev.map((p) => p.id === newPkg.id ? newPkg : p));
      onShowToast('Package Updated', `Saved changes to "${newPkg.title}"`, 'success');
    } else {
      if (onAddPackage) onAddPackage(newPkg);
      else setLocalPackages([newPkg, ...localPackages]);
      onShowToast(
        'Review Package Developed!',
        `"${newPkg.title}" is now published with ${newPkg.scoringType === 'ielts-band' ? 'IELTS 9-Band' : 'Percentage'} scoring.`,
        'success'
      );
    }

    setIsPackageModalOpen(false);
  };

  // Handler for Generating Lesson with AI
  const handleAutoGenerateLesson = () => {
    setLessonForm((prev) => ({ ...prev, isAiGenerating: true }));
    setTimeout(() => {
      setLessonForm((prev) => ({
        ...prev,
        isAiGenerating: false,
        duration: '50 mins',
        materialsCount: 5,
        contentSummary: `Complete high-yield review session covering core theoretical principles, test blueprint competencies, and common examiner traps for ${prev.subject}.`,
        keyTakeaways: [
          'High-Yield Concept 1: Primary governing formulas, theorems, and definitions tested in the exam.',
          'High-Yield Concept 2: Step-by-step rationalized problem solving approach and time management.',
          'High-Yield Concept 3: Elimination strategy for tricky distractor options in multiple choice items.'
        ]
      }));
      onShowToast('AI Lesson Generated!', 'Outline, takeaways, and diagnostic checkpoints drafted.', 'info');
    }, 600);
  };

  const handleLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) return;

    const newLesson: Lesson = {
      id: `les-${Date.now()}`,
      title: lessonForm.title,
      subject: lessonForm.subject,
      duration: lessonForm.duration,
      completed: false,
      progressPercent: 0,
      instructor: lessonForm.instructor,
      // Total materials = manually entered count + attached PDFs
      materialsCount: lessonForm.materialsCount + lessonPdfFiles.length,
      nextQuizAvailable: lessonForm.nextQuizAvailable,
      contentSummary: lessonForm.contentSummary,
      keyTakeaways: lessonForm.keyTakeaways,
    };

    if (onAddLesson) {
      onAddLesson(newLesson);
    } else {
      setLocalLessons([newLesson, ...localLessons]);
    }

    setIsLessonModalOpen(false);
    setLessonPdfFiles([]);
    onShowToast(
      'Lesson Published to Curriculum!',
      `"${newLesson.title}" published${lessonPdfFiles.length > 0 ? ` with ${lessonPdfFiles.length} PDF attachment${lessonPdfFiles.length > 1 ? 's' : ''}` : ''}.`,
      'success'
    );
  };

  const handleVerifyTx = (txId: string) => {
    if (onVerifyPaymentTransaction) {
      onVerifyPaymentTransaction(txId);
    } else {
      setLocalTransactions((prev) =>
        prev.map((t) => (t.id === txId ? { ...t, status: 'Verified' as const } : t))
      );
    }
    onShowToast('Payment Approved', 'Transaction verified and candidate admission approved.', 'success');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E1EFF7] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#3498DB] mb-1">
            <Users className="w-4 h-4" />
            <span>Meliora Review Center Operations Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C3E50]">
            {pageTitle ?? 'ReviewHub Administration Console'}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            {pageSubtitle ?? 'Develop review packages, generate curriculum lessons, manage IELTS band scoring, and oversee student tuition.'}
          </p>
        </div>

        {/* Top Control Actions: Develop Package & Generate Lesson */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={<BookOpen className="w-4 h-4 text-[#3498DB]" />}
            onClick={() => setIsLessonModalOpen(true)}
            className="border-[#3498DB] text-[#2980B9] hover:bg-[#D6ECFA]/40"
          >
            Generate Lesson
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={() => handleOpenDevelopPackage()}
            className="bg-gradient-to-r from-[#3498DB] to-[#5DADE2] hover:from-[#2980B9] hover:to-[#3498DB] text-white shadow-sm"
          >
            Develop New Package
          </Button>

          <Button
            variant="secondary"
            size="md"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsEnrollModalOpen(true)}
          >
            Enroll Student
          </Button>
        </div>
      </div>

      {/* Sub-Navigation Tabs — only show allowed tabs */}
      <div className="flex items-center gap-2 border-b border-[#E1EFF7] pb-2 overflow-x-auto">
        {allowedTabs.includes('roster') && (
        <button
          onClick={() => setActiveAdminTab('roster')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeAdminTab === 'roster'
              ? 'bg-[#3498DB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#2C3E50] hover:bg-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Students ({students.length})</span>
        </button>
        )}

        {allowedTabs.includes('packages') && (
        <button
          onClick={() => setActiveAdminTab('packages')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeAdminTab === 'packages'
              ? 'bg-[#3498DB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#2C3E50] hover:bg-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Review Packages ({packagesList.length})</span>
        </button>
        )}

        {allowedTabs.includes('lessons') && (
        <button
          onClick={() => setActiveAdminTab('lessons')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeAdminTab === 'lessons'
              ? 'bg-[#3498DB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#2C3E50] hover:bg-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Lessons ({lessonsList.length})</span>
        </button>
        )}

        {allowedTabs.includes('payments') && (
        <button
          onClick={() => setActiveAdminTab('payments')}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeAdminTab === 'payments'
              ? 'bg-[#3498DB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#2C3E50] hover:bg-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payments ({transactionsList.length})</span>
        </button>
        )}
      </div>

      {/* VIEW A: STUDENT ROSTERS */}
      {activeAdminTab === 'roster' && (
        <Card className="border-[#E1EFF7]">
          <CardHeader
            title="Student Roster & Examination Readiness"
            subtitle={`Showing ${filteredStudents.length} registered students`}
          />

          <div className="p-5 border-b border-[#F0F6FA] bg-[#FAFDFE] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, ID, or email..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#D6ECFA] focus:outline-none focus:ring-2 focus:ring-[#3498DB] bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-white border border-[#D6ECFA] rounded-xl text-xs font-medium">
                {(['All', 'Paid', 'Pending'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      statusFilter === status
                        ? 'bg-[#3498DB] text-white shadow-xs font-semibold'
                        : 'text-[#64748B] hover:text-[#2C3E50]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E1EFF7] bg-[#F4FAFD] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3.5 px-5">Student / ID</th>
                  <th className="py-3.5 px-5">Review Package</th>
                  <th className="py-3.5 px-5">Batch Schedule</th>
                  <th className="py-3.5 px-5">Payment Status</th>
                  <th className="py-3.5 px-5">Academic Progress</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F6FA] text-xs">
                {filteredStudents.map((stu) => (
                  <tr key={stu.id} className="hover:bg-[#FAFDFE] transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-bold text-[#2C3E50] text-sm">{stu.name}</div>
                      <div className="text-[11px] text-[#64748B]">{stu.email}</div>
                      <div className="text-[10px] font-mono text-[#94A3B8]">{stu.studentId}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-semibold text-[#2C3E50]">{stu.packageTitle}</div>
                      <div className="text-[11px] font-mono text-[#64748B]">{stu.amount}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="text-[#2C3E50]">{stu.batch}</div>
                      <div className="text-[11px] text-[#94A3B8]">Enrolled {stu.enrollmentDate}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold font-mono ${
                        stu.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {stu.paymentStatus === 'Paid' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        <span>{stu.paymentStatus}</span>
                      </span>
                    </td>
                    <td className="py-4 px-5 min-w-[140px]">
                      <ProgressBar
                        value={stu.academicProgress}
                        showPercent={true}
                        size="sm"
                        color={stu.academicProgress >= 70 ? 'bg-emerald-500' : 'bg-[#3498DB]'}
                      />
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedStudentDetail(stu)}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* VIEW B: REVIEW PACKAGES & IELTS */}
      {activeAdminTab === 'packages' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-[#E1EFF7] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                value={packageSearch}
                onChange={(e) => setPackageSearch(e.target.value)}
                placeholder="Search packages by title or keyword..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#D6ECFA]"
              />
            </div>
            <Button
              variant="primary"
              size="md"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={() => handleOpenDevelopPackage()}
            >
              Develop New Package
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => (
              <Card key={pkg.id} className="border-[#E1EFF7] flex flex-col justify-between">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-[#3498DB]">{pkg.category}</span>
                    {pkg.scoringType === 'ielts-band' && (
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        IELTS Band Score (1.0-9.0)
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-[#2C3E50] mb-1">{pkg.title}</h3>
                  <p className="text-xs text-[#64748B] mb-3 line-clamp-2">{pkg.targetAudience}</p>
                  <div className="py-2 border-y border-[#F0F6FA] mb-4 flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-mono text-[#2C3E50]">{pkg.price}</span>
                    <span className="text-xs text-[#64748B]">/ {pkg.period}</span>
                  </div>
                  <div className="text-xs text-[#64748B] space-y-1 mb-4">
                    <div>• {pkg.totalModules} Curriculum Modules</div>
                    <div>• {pkg.mockExamsCount} Full Diagnostic Mock Exams</div>
                  </div>
                  <div className="pt-2 border-t border-[#F0F6FA] flex items-center justify-between">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Edit3 className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenDevelopPackage(pkg)}
                    >
                      Edit Package
                    </Button>
                    <button
                      onClick={() => onDeletePackage?.(pkg.id)}
                      className="text-[#94A3B8] hover:text-rose-600 p-2"
                      title="Archive package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* VIEW C: CURRICULUM LESSONS & GENERATOR */}
      {activeAdminTab === 'lessons' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-xl border border-[#E1EFF7] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                value={lessonSearch}
                onChange={(e) => setLessonSearch(e.target.value)}
                placeholder="Search lessons by topic or faculty..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#D6ECFA]"
              />
            </div>
            <Button
              variant="primary"
              size="md"
              icon={<BookOpen className="w-4 h-4" />}
              onClick={() => setIsLessonModalOpen(true)}
            >
              Generate New Lesson
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLessons.map((l) => (
              <Card key={l.id} className="border-[#E1EFF7]">
                <CardBody className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#3498DB]">{l.subject}</span>
                    <span className="text-[#64748B] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {l.duration}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#2C3E50]">{l.title}</h4>
                  <p className="text-xs text-[#64748B]">Faculty: {l.instructor} · {l.materialsCount} Reviewer Materials</p>
                  {l.contentSummary && (
                    <p className="text-xs text-[#2C3E50] bg-[#F4FAFD] p-2.5 rounded-lg border border-[#D6ECFA]">
                      {l.contentSummary}
                    </p>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* VIEW D: TUITION PAYMENTS & LEDGER */}
      {activeAdminTab === 'payments' && (
        <Card className="border-[#E1EFF7]">
          <CardHeader
            title="Tuition Payments & Transaction Ledger"
            subtitle="Verified multi-channel payments (GCash, Maya, Cards, Bank Deposits)"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E1EFF7] bg-[#F4FAFD] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Student / Email</th>
                  <th className="py-3 px-5">Review Program</th>
                  <th className="py-3 px-5">Method</th>
                  <th className="py-3 px-5">Reference No.</th>
                  <th className="py-3 px-5">Amount</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F6FA]">
                {transactionsList.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#FAFDFE]">
                    <td className="py-3.5 px-5 text-[#64748B]">{tx.date}</td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-[#2C3E50]">{tx.studentName}</div>
                      <div className="text-[11px] text-[#64748B]">{tx.studentEmail}</div>
                    </td>
                    <td className="py-3.5 px-5 font-medium text-[#2C3E50]">{tx.packageTitle}</td>
                    <td className="py-3.5 px-5">
                      <span className="font-semibold text-[#3498DB]">{tx.paymentMethod}</span>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[#64748B]">{tx.referenceNumber}</td>
                    <td className="py-3.5 px-5 font-bold font-mono text-[#2C3E50]">{tx.amount}</td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        tx.status === 'Verified'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      {tx.status !== 'Verified' ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleVerifyTx(tx.id)}
                          className="text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-300"
                        >
                          Approve
                        </Button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-semibold">Cleared</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* MODAL: GENERATE LESSON (AI-ASSISTED) */}
      <Modal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        title="Generate New Curriculum Lesson"
        subtitle="Create high-yield video lecture modules and diagnostic checkpoints"
        maxWidth="xl"
      >
        <form onSubmit={handleLessonSubmit} className="space-y-4">
          <div className="p-3 bg-[#F4FAFD] rounded-xl border border-[#D6ECFA] flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold text-[#3498DB]">AI Lesson Drafting Engine:</span>
              <p className="text-[#64748B]">Click to auto-generate structured takeaways & syllabus checkpoints.</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5 text-[#3498DB]" />}
              onClick={handleAutoGenerateLesson}
            >
              {lessonForm.isAiGenerating ? 'Drafting...' : 'Auto-Generate with AI'}
            </Button>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C3E50] mb-1">Lesson Title *</label>
            <input
              type="text"
              required
              value={lessonForm.title}
              onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D6ECFA] bg-[#FAFDFE]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2C3E50] mb-1">Subject / Domain</label>
              <input
                type="text"
                required
                value={lessonForm.subject}
                onChange={(e) => setLessonForm({ ...lessonForm, subject: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D6ECFA] bg-[#FAFDFE]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C3E50] mb-1">Faculty Instructor</label>
              <input
                type="text"
                required
                value={lessonForm.instructor}
                onChange={(e) => setLessonForm({ ...lessonForm, instructor: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D6ECFA] bg-[#FAFDFE]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2C3E50] mb-1">Duration</label>
              <input
                type="text"
                value={lessonForm.duration}
                onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D6ECFA] bg-[#FAFDFE]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C3E50] mb-1">Additional Material Count</label>
              <input
                type="number"
                min={0}
                value={lessonForm.materialsCount}
                onChange={(e) => setLessonForm({ ...lessonForm, materialsCount: Number(e.target.value) })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D6ECFA] bg-[#FAFDFE]"
              />
            </div>
          </div>

          {/* PDF Lesson Attachments */}
          <div>
            <label className="block text-xs font-bold text-[#2C3E50] mb-1.5">
              Attach PDF Lesson Materials
              <span className="ml-1.5 text-[11px] font-normal text-[#64748B]">(PDF only · multiple allowed)</span>
            </label>

            {/* Drop zone / file picker */}
            <label
              htmlFor="lesson-pdf-upload"
              className="flex flex-col items-center justify-center w-full px-4 py-5 border-2 border-dashed border-[#BCE0F7] rounded-xl bg-[#F4FAFD] hover:bg-[#EEF7FD] hover:border-[#3498DB] transition-colors cursor-pointer group"
            >
              <FileText className="w-7 h-7 text-[#3498DB] mb-2 group-hover:scale-105 transition-transform" />
              <span className="text-xs font-semibold text-[#3498DB]">Click to browse or drag PDF files here</span>
              <span className="text-[11px] text-[#94A3B8] mt-0.5">Accepted: .pdf · Max 20 MB per file</span>
              <input
                id="lesson-pdf-upload"
                type="file"
                accept=".pdf,application/pdf"
                multiple
                className="sr-only"
                onChange={handlePdfSelect}
              />
            </label>

            {/* Attached file list */}
            {lessonPdfFiles.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {lessonPdfFiles.map((file) => (
                  <li
                    key={file.name}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-white border border-[#D6ECFA] text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-[#3498DB] shrink-0" />
                      <span className="font-medium text-[#2C3E50] truncate">{file.name}</span>
                      <span className="text-[#94A3B8] shrink-0">
                        ({(file.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePdf(file.name)}
                      className="text-[#94A3B8] hover:text-rose-500 shrink-0 cursor-pointer transition-colors"
                      aria-label={`Remove ${file.name}`}
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {lessonPdfFiles.length === 0 && (
              <p className="mt-1.5 text-[11px] text-[#94A3B8]">No PDF files attached yet.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C3E50] mb-1">Content Summary</label>
            <textarea
              rows={2}
              value={lessonForm.contentSummary}
              onChange={(e) => setLessonForm({ ...lessonForm, contentSummary: e.target.value })}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#D6ECFA] bg-[#FAFDFE]"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F0F6FA]">
            <Button variant="secondary" size="md" onClick={() => setIsLessonModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" icon={<BookOpen className="w-4 h-4" />}>
              Publish Lesson to Curriculum
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: DEVELOP NEW REVIEW PACKAGE (WITH IELTS BAND SCORE OPTION) */}
      <Modal
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        title={editingPackageId ? 'Edit Review Package' : 'Develop New Review Package'}
        subtitle="Configure syllabus, IELTS band evaluation system, and pricing"
        maxWidth="2xl"
      >
        <form onSubmit={handlePackageSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2C3E50] mb-1">Review Program Title *</label>
              <input
                type="text"
                required
                value={packageForm.title}
                onChange={(e) => setPackageForm({ ...packageForm, title: e.target.value })}
                placeholder="e.g. IELTS Academic Masterclass (Band 7.5+)"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D6ECFA] bg-[#FAFDFE]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C3E50] mb-1">Category</label>
              <select
                value={packageForm.category}
                onChange={(e) => setPackageForm({ ...packageForm, category: e.target.value as any })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D6ECFA] bg-[#FAFDFE]"
              >
                <option value="Licensure">PRC Licensure</option>
                <option value="IELTS / Language">IELTS / English Proficiency</option>
                <option value="College Entrance">College Entrance (CET)</option>
                <option value="Civil Service">Civil Service</option>
                <option value="Specialized">Specialized / Working Student</option>
              </select>
            </div>
          </div>

          {/* Test Scoring System: Standard % vs IELTS Band Score */}
          <div className="p-4 bg-[#F4FAFD] rounded-xl border border-[#D6ECFA] space-y-2">
            <label className="block text-xs font-bold text-[#2C3E50]">
              Evaluation Test Scoring System *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                packageForm.scoringType === 'percentage'
                  ? 'border-[#3498DB] bg-white text-[#2980B9] font-bold shadow-xs'
                  : 'border-[#E1EFF7] bg-white text-[#64748B]'
              }`}>
                <input
                  type="radio"
                  name="scoringType"
                  value="percentage"
                  checked={packageForm.scoringType === 'percentage'}
                  onChange={() => setPackageForm({ ...packageForm, scoringType: 'percentage' })}
                  className="text-[#3498DB]"
                />
                <div>
                  <div>Standard Percentage (0-100%)</div>
                  <div className="text-[10px] text-[#64748B] font-normal">Best for PRC Boards, CETs, and Civil Service</div>
                </div>
              </label>

              <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                packageForm.scoringType === 'ielts-band'
                  ? 'border-[#3498DB] bg-white text-[#2980B9] font-bold shadow-xs'
                  : 'border-[#E1EFF7] bg-white text-[#64748B]'
              }`}>
                <input
                  type="radio"
                  name="scoringType"
                  value="ielts-band"
                  checked={packageForm.scoringType === 'ielts-band'}
                  onChange={() => setPackageForm({ ...packageForm, scoringType: 'ielts-band' })}
                  className="text-[#3498DB]"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-[#3498DB]" />
                    <span>Official IELTS Band Score (1.0 - 9.0)</span>
                  </div>
                  <div className="text-[10px] text-[#64748B] font-normal">Computes official Band & CEFR benchmarks</div>
                </div>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2C3E50] mb-1">Tuition Fee</label>
              <input
                type="text"
                value={packageForm.price}
                onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D6ECFA] bg-[#FAFDFE] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C3E50] mb-1">Access Period</label>
              <input
                type="text"
                value={packageForm.period}
                onChange={(e) => setPackageForm({ ...packageForm, period: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D6ECFA] bg-[#FAFDFE]"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F0F6FA]">
            <Button variant="secondary" size="md" onClick={() => setIsPackageModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Publish Package
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ENROLL STUDENT */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Enroll New Student"
        subtitle="Manually register student record into review cohort"
        maxWidth="md"
      >
        <form onSubmit={handleEnrollSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#2C3E50] mb-1">Student Full Name</label>
            <input
              type="text"
              required
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D6ECFA] bg-[#FAFDFE]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#2C3E50] mb-1">Email Address</label>
            <input
              type="email"
              required
              value={newStudent.email}
              onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-[#D6ECFA] bg-[#FAFDFE]"
            />
          </div>
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#F0F6FA]">
            <Button variant="secondary" size="md" onClick={() => setIsEnrollModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Confirm Enrollment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
