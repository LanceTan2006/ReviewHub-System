import React, { useState } from 'react';
import { ActivePage, UserRole, ReviewPackage, Lesson, PaymentTransaction } from './types';
import { reviewPackages, sampleLessons, samplePaymentTransactions } from './data/mockData';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer, ToastMessage } from './components/Toast';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AIReviewerPage } from './pages/AIReviewerPage';
import { QuizPage } from './pages/QuizPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { LessonsPage } from './pages/LessonsPage';
import { PackagesPage } from './pages/PackagesPage';
import { ProgressPage } from './pages/ProgressPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { StudentEnrollmentPage } from './pages/StudentEnrollmentPage';
import { Menu, X, Sparkles, LayoutDashboard, Shield, GraduationCap, CreditCard } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<ActivePage>('landing');
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [packages, setPackages] = useState<ReviewPackage[]>(reviewPackages);
  const [lessons, setLessons] = useState<Lesson[]>(sampleLessons);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(samplePaymentTransactions);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleAddPackage = (newPkg: ReviewPackage) => {
    setPackages((prev) => [newPkg, ...prev]);
  };

  const handleUpdatePackage = (updated: ReviewPackage) => {
    setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeletePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddLesson = (newLesson: Lesson) => {
    setLessons((prev) => [newLesson, ...prev]);
  };

  const handleVerifyTransaction = (txId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status: 'Verified' as const } : t))
    );
  };

  const handleEnrollComplete = (
    studentName: string,
    packageTitle: string,
    amount: string,
    paymentMethod: string,
    refNo: string
  ) => {
    const newTx: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      studentId: `MH-2026-08${Math.floor(60 + Math.random() * 30)}`,
      studentName,
      studentEmail: 'alyssa.reyes@univ.edu.ph',
      packageTitle,
      amount,
      paymentMethod: paymentMethod as any,
      referenceNumber: refNo,
      status: 'Verified',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    setTransactions((prev) => [newTx, ...prev]);
    setUserRole('student');
  };

  const showToast = (
    title: string,
    description?: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) => {
    const id = `toast-${Date.now()}`;
    const newToast: ToastMessage = { id, title, description, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLoginSuccess = (role: UserRole) => {
    setUserRole(role);
    if (role === 'admin') {
      setCurrentPage('admin-dashboard');
    } else {
      setCurrentPage('student-dashboard');
    }
  };

  const handleLogout = () => {
    setUserRole('guest');
    setCurrentPage('landing');
    showToast('Signed Out', 'You have been returned to the public landing page.', 'info');
  };

  const isPortalView =
    currentPage !== 'landing' && currentPage !== 'login';

  const isStudentArea =
    currentPage.startsWith('student') ||
    currentPage === 'ai-reviewer' ||
    currentPage === 'quiz';

  return (
    <div className="min-h-screen bg-[#F4FAFD] text-[#2C3E50] flex flex-col font-sans">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Public Pages: Landing Page */}
      {currentPage === 'landing' && (
        <>
          <Navbar
            currentPage={currentPage}
            onNavigate={(page) => setCurrentPage(page)}
            userRole={userRole}
            onRoleChange={setUserRole}
            onOpenLogin={() => setCurrentPage('login')}
          />
          <LandingPage
            onNavigate={(page) => setCurrentPage(page)}
            onOpenLogin={() => setCurrentPage('login')}
            onShowToast={showToast}
            packages={packages}
          />
        </>
      )}

      {/* Login Page */}
      {currentPage === 'login' && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onNavigate={(page) => setCurrentPage(page)}
          onShowToast={showToast}
        />
      )}

      {/* Portal Views (Student & Admin) with Unified Sidebar and Responsive Drawer */}
      {isPortalView && (
        <div className="flex h-screen overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block shrink-0">
            <Sidebar
              currentPage={currentPage}
              onNavigate={(page) => {
                setCurrentPage(page);
                setMobileSidebarOpen(false);
              }}
              role={isStudentArea ? 'student' : 'admin'}
              onLogout={handleLogout}
            />
          </div>

          {/* Mobile Sidebar Drawer Overlay */}
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <div className="relative z-10 w-72 h-full bg-white shadow-xl flex flex-col">
                <div className="p-4 border-b border-[#E1EFF7] flex items-center justify-between">
                  <span className="font-bold text-[#2C3E50]">Menu Navigation</span>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 text-[#64748B] hover:text-[#2C3E50] rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <Sidebar
                    currentPage={currentPage}
                    onNavigate={(page) => {
                      setCurrentPage(page);
                      setMobileSidebarOpen(false);
                    }}
                    role={isStudentArea ? 'student' : 'admin'}
                    onLogout={handleLogout}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Portal Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
            {/* Top Workspace App Header */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E1EFF7] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden p-2 text-[#2C3E50] hover:bg-[#F4FAFD] rounded-xl cursor-pointer"
                  aria-label="Open sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 text-xs text-[#64748B] truncate">
                  <button
                    onClick={() => setCurrentPage('landing')}
                    className="hover:text-[#3498DB] font-medium hidden sm:inline truncate"
                  >
                    ReviewHub
                  </button>
                  <span className="hidden sm:inline">/</span>
                  <span className="font-semibold text-[#2C3E50] capitalize truncate">
                    {currentPage.replace('student-', '').replace('admin-', '').replace('-', ' ')}
                  </span>
                </div>
              </div>

              {/* Quick Jump Switcher Bar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage('landing')}
                  className="text-xs font-semibold text-[#64748B] hover:text-[#3498DB] px-2.5 py-1.5 rounded-lg border border-[#E1EFF7] bg-white transition-colors cursor-pointer hidden sm:flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-[#3498DB]" />
                  <span>Landing Page</span>
                </button>

                <button
                  onClick={() =>
                    setCurrentPage(isStudentArea ? 'admin-dashboard' : 'student-dashboard')
                  }
                  className="text-xs font-bold text-[#2980B9] bg-[#D6ECFA]/60 hover:bg-[#D6ECFA] px-3 py-1.5 rounded-xl border border-[#BCE0F7] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isStudentArea ? (
                    <>
                      <Shield className="w-3.5 h-3.5 text-[#3498DB]" />
                      <span>Switch to Admin Staff</span>
                    </>
                  ) : (
                    <>
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#3498DB]" />
                      <span>Switch to Student Space</span>
                    </>
                  )}
                </button>
              </div>
            </header>

            {/* Dynamic View Router */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {currentPage === 'student-dashboard' && (
                <StudentDashboard onNavigate={setCurrentPage} onShowToast={showToast} />
              )}
              {currentPage === 'student-lessons' && (
                <LessonsPage onNavigate={setCurrentPage} onShowToast={showToast} />
              )}
              {currentPage === 'student-packages' && (
                <PackagesPage onNavigate={setCurrentPage} onShowToast={showToast} packages={packages} />
              )}
              {(currentPage === 'student-enrollment' || currentPage === 'student-payment') && (
                <StudentEnrollmentPage
                  onNavigate={setCurrentPage}
                  onShowToast={showToast}
                  packages={packages}
                  onEnrollComplete={handleEnrollComplete}
                />
              )}
              {currentPage === 'ai-reviewer' && (
                <AIReviewerPage onNavigate={setCurrentPage} onShowToast={showToast} />
              )}
              {currentPage === 'quiz' && (
                <QuizPage onNavigate={setCurrentPage} onShowToast={showToast} />
              )}
              {currentPage === 'student-progress' && (
                <ProgressPage onNavigate={setCurrentPage} onShowToast={showToast} />
              )}
              {currentPage === 'student-certificates' && (
                <CertificatesPage onNavigate={setCurrentPage} onShowToast={showToast} />
              )}
              {(currentPage === 'admin-dashboard' ||
                currentPage === 'admin-students' ||
                currentPage === 'admin-enrollment' ||
                currentPage === 'admin-payments' ||
                currentPage === 'admin-packages' ||
                currentPage === 'admin-lessons' ||
                currentPage === 'admin-schedule' ||
                currentPage === 'admin-reports' ||
                currentPage === 'admin-settings') && (
                <AdminDashboard
                  onNavigate={setCurrentPage}
                  onShowToast={showToast}
                  currentPage={currentPage}
                  packages={packages}
                  onAddPackage={handleAddPackage}
                  onUpdatePackage={handleUpdatePackage}
                  onDeletePackage={handleDeletePackage}
                  lessons={lessons}
                  onAddLesson={handleAddLesson}
                  transactions={transactions}
                  onVerifyPaymentTransaction={handleVerifyTransaction}
                />
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
