import React, { useState } from 'react';
import { ActivePage, ReviewPackage, Lesson, PaymentTransaction } from './types';
import { reviewPackages, sampleLessons, samplePaymentTransactions } from './data/mockData';
import {
  AuthUser, PAGE_PERMISSIONS, ROLE_HOME,
  hasPermission, buildAuthUser,
} from './rbac';

import { Navbar }               from './components/Navbar';
import { Sidebar }              from './components/Sidebar';
import { ToastContainer, ToastMessage } from './components/Toast';

import { LandingPage }          from './pages/LandingPage';
import { LoginPage }            from './pages/LoginPage';
import { StudentDashboard }     from './pages/StudentDashboard';
import { AIReviewerPage }       from './pages/AIReviewerPage';
import { QuizPage }             from './pages/QuizPage';
import { AdminDashboard }       from './pages/AdminDashboard';
import { LessonsPage }          from './pages/LessonsPage';
import { PackagesPage }         from './pages/PackagesPage';
import { ProgressPage }         from './pages/ProgressPage';
import { CertificatesPage }     from './pages/CertificatesPage';
import { StudentEnrollmentPage }from './pages/StudentEnrollmentPage';
import { UserManagementPage }   from './pages/UserManagementPage';
import { PortalPage }           from './pages/PortalPage';

import { Menu, X } from 'lucide-react';
import logoImg from './assets/images/reviewhub_logo.png';

// ── Role colour / icon map for the portal header badge ─────────
const ROLE_BADGE: Record<string, { label: string; cls: string; icon: string }> = {
  student:   { label: 'Student Portal',    cls: 'text-[#2980B9] bg-blue-50 border-blue-200',     icon: 'bi-mortarboard' },
  frontdesk: { label: 'Front Desk Portal', cls: 'text-emerald-700 bg-emerald-50 border-emerald-200', icon: 'bi-person-badge' },
  proctor:   { label: 'Proctor Portal',    cls: 'text-amber-700 bg-amber-50 border-amber-200',   icon: 'bi-journal-check' },
  manager:   { label: 'Manager Portal',    cls: 'text-purple-700 bg-purple-50 border-purple-200', icon: 'bi-shield-fill-check' },
  admin:     { label: 'Admin Portal',      cls: 'text-red-700 bg-red-50 border-red-200',        icon: 'bi-shield-lock-fill' },
  guest:     { label: 'Guest',             cls: 'text-[#64748B] bg-gray-50 border-gray-200',     icon: 'bi-person' },
};

export default function App() {
  const [currentPage, setCurrentPage]   = useState<ActivePage>('landing');
  const [authUser,    setAuthUser]       = useState<AuthUser | null>(null);
  const [packages,    setPackages]       = useState<ReviewPackage[]>(reviewPackages);
  const [lessons,     setLessons]        = useState<Lesson[]>(sampleLessons);
  const [transactions,setTransactions]   = useState<PaymentTransaction[]>(samplePaymentTransactions);
  const [toasts,      setToasts]         = useState<ToastMessage[]>([]);
  const [mobileSidebar,setMobileSidebar] = useState(false);

  // ── Toast ───────────────────────────────────────────────────
  const showToast = (title: string, desc?: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id  = `toast-${Date.now()}`;
    const msg: ToastMessage = { id, title, description: desc, type };
    setToasts((prev) => [...prev, msg]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  };

  const handleDismissToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // ── Permission-based navigation guard ───────────────────────
  const safeNavigate = (page: ActivePage) => {
    // Public pages — always allowed
    if (page === 'landing' || page === 'login') { setCurrentPage(page); return; }

    // Must be authenticated
    if (!authUser) {
      showToast('Login Required', 'Please sign in to access that page.', 'info');
      setCurrentPage('login');
      return;
    }

    // Check permission for the requested page
    const requiredPerm = PAGE_PERMISSIONS[page];
    if (requiredPerm && !hasPermission(authUser, requiredPerm)) {
      showToast(
        '403 — Access Denied',
        `Your roles (${authUser.roles.join(', ')}) do not include the "${requiredPerm}" permission needed for this page.`,
        'error'
      );
      // Redirect to the user's home page instead
      setCurrentPage(ROLE_HOME[authUser.primaryRole]);
      return;
    }

    setCurrentPage(page);
  };

  // ── Login / Logout ──────────────────────────────────────────
  const handleLoginSuccess = (user: AuthUser) => {
    setAuthUser(user);
    const home = ROLE_HOME[user.primaryRole];
    setCurrentPage(home);
  };

  const handleLogout = () => {
    setAuthUser(null);
    setCurrentPage('landing');
    showToast('Signed Out', 'You have been returned to the landing page.', 'info');
  };

  // ── Package / Lesson / Transaction handlers ─────────────────
  const handleAddPackage     = (p: ReviewPackage)   => setPackages((prev) => [p, ...prev]);
  const handleUpdatePackage  = (p: ReviewPackage)   => setPackages((prev) => prev.map((x) => x.id === p.id ? p : x));
  const handleDeletePackage  = (id: string)         => setPackages((prev) => prev.filter((x) => x.id !== id));
  const handleAddLesson      = (l: Lesson)          => setLessons((prev) => [l, ...prev]);
  const handleVerifyTx       = (id: string)         => setTransactions((prev) => prev.map((t) => t.id === id ? { ...t, status: 'Verified' as const } : t));

  const handleEnrollComplete = (studentName: string, packageTitle: string, amount: string, paymentMethod: string, refNo: string) => {
    const tx: PaymentTransaction = {
      id: `tx-${Date.now()}`,
      studentId: `MH-2026-08${Math.floor(60 + Math.random() * 30)}`,
      studentName,
      studentEmail: authUser?.email ?? 'student@univ.edu.ph',
      packageTitle,
      amount,
      paymentMethod: paymentMethod as any,
      referenceNumber: refNo,
      status: 'Verified',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setTransactions((prev) => [tx, ...prev]);
  };

  // ── Derived state ────────────────────────────────────────────
  const isPortalView = currentPage !== 'landing' && currentPage !== 'login';
  const primaryRole  = authUser?.primaryRole ?? 'guest';
  const badge        = ROLE_BADGE[primaryRole] ?? ROLE_BADGE.guest;

  // ── Page label for breadcrumb ─────────────────────────────
  const pageLabel = currentPage
    .replace(/^(student|frontdesk|proctor|manager|admin)-/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // ── Portal content router ─────────────────────────────────
  const renderPortalContent = () => {
    if (!authUser) return null;

    // ── Student pages with real components ──
    if (currentPage === 'student-dashboard')  return <StudentDashboard onNavigate={safeNavigate} onShowToast={showToast} />;
    if (currentPage === 'student-lessons')    return <LessonsPage onNavigate={safeNavigate} onShowToast={showToast} />;
    if (currentPage === 'student-packages')   return <PackagesPage onNavigate={safeNavigate} onShowToast={showToast} packages={packages} />;
    if (currentPage === 'student-enrollment' || currentPage === 'student-payment')
      return <StudentEnrollmentPage onNavigate={safeNavigate} onShowToast={showToast} packages={packages} onEnrollComplete={handleEnrollComplete} />;
    if (currentPage === 'ai-reviewer')        return <AIReviewerPage onNavigate={safeNavigate} onShowToast={showToast} />;
    if (currentPage === 'quiz')               return <QuizPage onNavigate={safeNavigate} onShowToast={showToast} mode="practice" />;
    if (currentPage === 'student-mock-exam')  return <QuizPage onNavigate={safeNavigate} onShowToast={showToast} mode="mock" />;
    if (currentPage === 'student-progress')   return <ProgressPage onNavigate={safeNavigate} onShowToast={showToast} />;
    if (currentPage === 'student-certificates') return <CertificatesPage onNavigate={safeNavigate} onShowToast={showToast} />;

    // ── Manager — User Management (needs assign_roles) ──
    if (currentPage === 'manager-users')
      return <UserManagementPage currentUser={authUser} onShowToast={showToast} />;

    // ── Legacy admin pages → AdminDashboard ──
    const adminPages: ActivePage[] = [
      'admin-dashboard','admin-students','admin-enrollment','admin-payments',
      'admin-packages','admin-lessons','admin-schedule','admin-reports','admin-settings',
    ];
    if (adminPages.includes(currentPage))
      return (
        <AdminDashboard
          onNavigate={safeNavigate}
          onShowToast={showToast}
          currentPage={currentPage}
          packages={packages}
          onAddPackage={handleAddPackage}
          onUpdatePackage={handleUpdatePackage}
          onDeletePackage={handleDeletePackage}
          lessons={lessons}
          onAddLesson={handleAddLesson}
          transactions={transactions}
          onVerifyPaymentTransaction={handleVerifyTx}
        />
      );

    // ── All other portal pages → PortalPage (real content per role) ──
    return (
      <PortalPage
        page={currentPage}
        user={authUser}
        onNavigate={safeNavigate}
        onShowToast={showToast}
        packages={packages}
        lessons={lessons}
        transactions={transactions}
        onAddLesson={handleAddLesson}
        onAddPackage={handleAddPackage}
        onUpdatePackage={handleUpdatePackage}
        onDeletePackage={handleDeletePackage}
        onVerifyTransaction={handleVerifyTx}
        onEnrollComplete={handleEnrollComplete}
      />
    );
  };

  return (
    <div className="min-h-screen bg-[#F4FAFD] text-[#2C3E50] flex flex-col font-sans">
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* ── Public: Landing ── */}
      {currentPage === 'landing' && (
        <>
          <Navbar
            currentPage={currentPage}
            onNavigate={safeNavigate}
            userRole={primaryRole as any}
            onRoleChange={() => {}}
            onOpenLogin={() => setCurrentPage('login')}
          />
          <LandingPage
            onNavigate={safeNavigate}
            onOpenLogin={() => setCurrentPage('login')}
            onShowToast={showToast}
            packages={packages}
          />
        </>
      )}

      {/* ── Public: Login ── */}
      {currentPage === 'login' && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onNavigate={(page) => setCurrentPage(page)}
          onShowToast={showToast}
        />
      )}

      {/* ── Portal: authenticated pages ── */}
      {isPortalView && (
        <div className="flex h-screen overflow-hidden">

          {/* Desktop Sidebar */}
          <div className="hidden lg:block shrink-0">
            <Sidebar
              currentPage={currentPage}
              onNavigate={safeNavigate}
              role={primaryRole}
              onLogout={handleLogout}
              userName={authUser?.name}
              userEmail={authUser?.email}
            />
          </div>

          {/* Mobile sidebar drawer */}
          {mobileSidebar && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => setMobileSidebar(false)}
              />
              <div className="relative z-10 w-72 h-full bg-white shadow-xl flex flex-col">
                <div className="p-4 border-b border-[#E1EFF7] flex items-center justify-between">
                  <img src={logoImg} alt="ReviewHub" className="h-7 w-auto object-contain" />
                  <button
                    onClick={() => setMobileSidebar(false)}
                    className="p-1.5 text-[#64748B] hover:text-[#2C3E50] rounded-lg cursor-pointer"
                    aria-label="Close sidebar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <Sidebar
                    currentPage={currentPage}
                    onNavigate={(p) => { safeNavigate(p); setMobileSidebar(false); }}
                    role={primaryRole}
                    onLogout={handleLogout}
                    userName={authUser?.name}
                    userEmail={authUser?.email}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main content area */}
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

            {/* Portal top bar */}
            <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E1EFF7] px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile menu toggle */}
                <button
                  onClick={() => setMobileSidebar(true)}
                  className="lg:hidden p-2 text-[#2C3E50] hover:bg-[#F4FAFD] rounded-xl cursor-pointer"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-5 h-5" />
                </button>

                {/* Breadcrumb */}
                <button
                  onClick={() => setCurrentPage('landing')}
                  className="hover:opacity-75 transition-opacity hidden sm:block shrink-0"
                  aria-label="Go to home"
                >
                  <img src={logoImg} alt="ReviewHub" className="h-6 w-auto object-contain" />
                </button>
                <span className="hidden sm:inline text-[#D6ECFA]">/</span>
                <span className="text-sm font-semibold text-[#2C3E50] truncate">{pageLabel}</span>
              </div>

              {/* Right: role badge + permissions count */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Home button */}
                <button
                  onClick={() => setCurrentPage('landing')}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#3498DB] px-2.5 py-1.5 rounded-lg border border-[#E1EFF7] bg-white transition-colors cursor-pointer"
                >
                  <i className="bi bi-house" aria-hidden="true" />
                  Home
                </button>

                {/* Role badge */}
                <div className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${badge.cls}`}>
                  <i className={`${badge.icon} text-xs`} aria-hidden="true" />
                  <span className="hidden sm:inline">{badge.label}</span>
                </div>

                {/* Permission count (tooltip-style info) */}
                {authUser && (
                  <div
                    className="text-[11px] font-mono font-bold px-2 py-1 rounded-lg bg-[#F4FAFD] border border-[#E1EFF7] text-[#64748B] hidden md:block"
                    title={`Permissions: ${[...authUser.effectivePermissions].join(', ')}`}
                  >
                    <i className="bi bi-key mr-1" aria-hidden="true" />
                    {authUser.effectivePermissions.size} perms
                  </div>
                )}
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8" id="main-content">
              {renderPortalContent()}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
