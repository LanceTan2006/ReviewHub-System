/**
 * PortalPage — Smart router that maps every role's pages to
 * real reused UI components. No "coming soon" blanks.
 *
 * Abstraction rule: permission strings are never shown to the user.
 * The 403 screen shows a plain "Contact your Manager" message only.
 */
import React, { useState } from 'react';
import { ActivePage, ReviewPackage, Lesson, PaymentTransaction } from '../types';
import { AuthUser, hasPermission, PAGE_PERMISSIONS } from '../rbac';

// ── Reused page components ─────────────────────────────────────
import { LessonsPage }           from './LessonsPage';
import { PackagesPage }          from './PackagesPage';
import { ProgressPage }          from './ProgressPage';
import { CertificatesPage }      from './CertificatesPage';
import { StudentEnrollmentPage } from './StudentEnrollmentPage';
import { AdminDashboard }        from './AdminDashboard';

// ── Shared UI primitives ───────────────────────────────────────
import { Card, CardBody, CardHeader } from '../components/Card';
import { Button }                from '../components/Button';
import { ProgressBar }           from '../components/ProgressBar';
import { sampleEnrolledStudents, reviewPackages, sampleLessons, samplePaymentTransactions } from '../data/mockData';

interface PortalPageProps {
  page: ActivePage;
  user: AuthUser;
  onNavigate: (page: ActivePage) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
  packages?: ReviewPackage[];
  lessons?: Lesson[];
  transactions?: PaymentTransaction[];
  onAddLesson?: (l: Lesson) => void;
  onAddPackage?: (p: ReviewPackage) => void;
  onUpdatePackage?: (p: ReviewPackage) => void;
  onDeletePackage?: (id: string) => void;
  onVerifyTransaction?: (id: string) => void;
  onEnrollComplete?: (name: string, pkg: string, amount: string, method: string, ref: string) => void;
}

// ── 403 screen — no permission strings exposed ─────────────────
const AccessDenied: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
    <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
      <i className="bi bi-shield-x text-4xl text-red-400" aria-hidden="true" />
    </div>
    <h2 className="text-2xl font-extrabold text-[#2C3E50]">Access Denied</h2>
    <p className="text-sm text-[#64748B] max-w-xs">
      You don't have access to this section. Contact your Manager to update your role assignments.
    </p>
  </div>
);

// ── Shared: Announcements board ────────────────────────────────
const AnnouncementsPage: React.FC<{ role: string; userName: string }> = ({ role, userName }) => {
  const announcements = [
    { id: 1, title: 'November 2026 Board Exam Preparation Schedule Released', date: 'Oct 30, 2026', category: 'Academic', body: 'The November 2026 PRC Licensure Examination intensive review schedule has been finalized. Students enrolled in Batch Alpha are required to attend the Saturday diagnostic mock exams starting November 2.', important: true },
    { id: 2, title: 'AI Reviewer Engine Updated — Gemini 2.0 Flash Integration', date: 'Oct 28, 2026', category: 'System', body: 'The AI Reviewer has been upgraded to Gemini 2.0 Flash. Upload your PDF notes and receive richer, more accurate summaries and flashcard sets. Response time reduced by 40%.', important: false },
    { id: 3, title: 'Holiday Schedule — November 1–2 Suspension of Classes', date: 'Oct 25, 2026', category: 'Calendar', body: 'In observance of All Saints\' Day and All Souls\' Day, all live Q&A sessions and on-site review classes will be suspended on November 1–2. Online AI Reviewer and self-paced modules remain available 24/7.', important: false },
    { id: 4, title: 'GCash & Maya Payment Processing — Scheduled Maintenance', date: 'Oct 22, 2026', category: 'Finance', body: 'GCash and Maya payment gateways will undergo scheduled maintenance on October 31 from 12:00 AM to 6:00 AM PHT. Please process tuition payments before or after this window.', important: false },
  ];
  const catColors: Record<string, string> = {
    Academic: 'bg-blue-50 text-blue-700 border-blue-200',
    System:   'bg-purple-50 text-purple-700 border-purple-200',
    Calendar: 'bg-amber-50 text-amber-700 border-amber-200',
    Finance:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-2xl border border-[#E1EFF7] flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#D6ECFA] flex items-center justify-center shrink-0">
          <i className="bi bi-megaphone-fill text-[#3498DB] text-xl" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#2C3E50]">Announcements</h1>
          <p className="text-sm text-[#64748B] mt-1">Latest updates from Meliora Learning Hub for {userName}.</p>
        </div>
      </div>
      <div className="space-y-4">
        {announcements.map((a) => (
          <div key={a.id} className={`p-5 rounded-2xl border bg-white ${a.important ? 'border-[#3498DB] shadow-sm' : 'border-[#E1EFF7]'}`}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                {a.important && (
                  <span className="text-[11px] font-bold bg-[#3498DB] text-white px-2 py-0.5 rounded-full">
                    <i className="bi bi-pin-fill mr-1" aria-hidden="true" />Pinned
                  </span>
                )}
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${catColors[a.category] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {a.category}
                </span>
              </div>
              <span className="text-xs text-[#94A3B8] shrink-0">{a.date}</span>
            </div>
            <h3 className="text-sm font-bold text-[#2C3E50] mb-1.5">{a.title}</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">{a.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Shared: Profile page ───────────────────────────────────────
const ProfilePage: React.FC<{ user: AuthUser }> = ({ user }) => {
  const roleColors: Record<string, string> = {
    student:   'bg-blue-50 text-blue-700 border-blue-200',
    frontdesk: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    proctor:   'bg-amber-50 text-amber-700 border-amber-200',
    manager:   'bg-purple-50 text-purple-700 border-purple-200',
  };
  const roleIcons: Record<string, string> = {
    student:   'bi-mortarboard',
    frontdesk: 'bi-person-badge',
    proctor:   'bi-journal-check',
    manager:   'bi-shield-fill-check',
  };
  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-2xl border border-[#E1EFF7] flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#D6ECFA] flex items-center justify-center shrink-0">
          <i className="bi bi-person-circle text-[#3498DB] text-xl" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#2C3E50]">My Profile</h1>
          <p className="text-sm text-[#64748B] mt-1">Manage your account information and security settings.</p>
        </div>
      </div>

      {/* Identity card */}
      <Card className="border-[#E1EFF7]">
        <CardBody className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                 style={{ background: 'linear-gradient(135deg,#3498DB,#5DADE2)' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-lg font-extrabold text-[#2C3E50]">{user.name}</div>
              <div className="text-sm text-[#64748B]">{user.email}</div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {user.roles.map((r) => (
                  <span key={r} className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${roleColors[r] ?? ''}`}>
                    <i className={`${roleIcons[r] ?? 'bi-person'} text-xs`} aria-hidden="true" />
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {[
              { label: 'Full Name',     value: user.name },
              { label: 'Email Address', value: user.email },
              { label: 'User ID',       value: user.id },
              { label: 'Primary Role',  value: user.primaryRole.charAt(0).toUpperCase() + user.primaryRole.slice(1) },
            ].map((f) => (
              <div key={f.label} className="p-3 rounded-xl bg-[#F4FAFD] border border-[#E1EFF7]">
                <dt className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest mb-0.5">{f.label}</dt>
                <dd className="font-semibold text-[#2C3E50] truncate">{f.value}</dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>

      {/* Access summary — friendly, no technical permission strings */}
      <Card className="border-[#E1EFF7]">
        <CardHeader title="My Access Summary" subtitle="Sections available to you based on your role" />
        <CardBody className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {user.roles.flatMap((r) => {
              const sectionMap: Record<string, string[]> = {
                student:   ['Dashboard','Lessons','Practice Quiz','Mock Exam','AI Reviewer','Certificates','Announcements'],
                frontdesk: ['Dashboard','Student Records','Enrollment','Payments','Schedule','Reports','Announcements'],
                proctor:   ['Dashboard','Lesson Management','Quiz Management','Mock Exams','Student Performance','Announcements'],
                manager:   ['Dashboard','User Management','All Student Data','Packages','Enrollment Monitor','Payment Monitor','Reports','Analytics','Settings','Backup'],
              };
              return (sectionMap[r] ?? []).map((s) => ({ role: r, section: s }));
            })
            .filter((item, idx, arr) => arr.findIndex((x) => x.section === item.section) === idx)
            .map((item) => (
              <div key={item.section} className="flex items-center gap-2 p-2.5 rounded-lg bg-[#F4FAFD] border border-[#E1EFF7] text-xs font-medium text-[#2C3E50]">
                <i className="bi bi-check-circle-fill text-emerald-500 text-sm shrink-0" aria-hidden="true" />
                {item.section}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

// ── Shared: Schedule page ──────────────────────────────────────
const SchedulePage: React.FC<{ readOnly?: boolean }> = ({ readOnly = false }) => {
  const schedule = [
    { day: 'Monday',    time: '8:00 AM – 11:00 AM',  subject: 'General Engineering Sciences',     instructor: 'Engr. Marco Santos',    room: 'Room 302', batch: 'Batch Alpha' },
    { day: 'Monday',    time: '1:00 PM – 4:00 PM',   subject: 'Applied Mathematics',              instructor: 'Prof. Helen Ramirez',   room: 'Room 201', batch: 'Batch Beta' },
    { day: 'Tuesday',   time: '8:00 AM – 11:00 AM',  subject: 'Constitutional Law & Ethics',      instructor: 'Atty. Cristina V.',     room: 'Room 101', batch: 'Batch Alpha' },
    { day: 'Wednesday', time: '2:00 PM – 5:00 PM',   subject: 'Fluid Mechanics',                  instructor: 'Dr. Ramon Delgado',     room: 'Lab 2',    batch: 'Batch Gamma' },
    { day: 'Thursday',  time: '8:00 AM – 10:00 AM',  subject: 'Organic Chemistry',                instructor: 'Dr. Angela Tan',        room: 'Lab 1',    batch: 'Batch Alpha' },
    { day: 'Saturday',  time: '7:00 AM – 12:00 PM',  subject: 'Full Diagnostic Mock Examination', instructor: 'All Faculty',           room: 'Main Hall', batch: 'All Batches' },
  ];
  const dayColors: Record<string, string> = {
    Monday: 'bg-blue-50 text-blue-700', Tuesday: 'bg-purple-50 text-purple-700',
    Wednesday: 'bg-emerald-50 text-emerald-700', Thursday: 'bg-amber-50 text-amber-700',
    Friday: 'bg-rose-50 text-rose-700', Saturday: 'bg-indigo-50 text-indigo-700',
  };
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-2xl border border-[#E1EFF7] flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#D6ECFA] flex items-center justify-center shrink-0">
          <i className="bi bi-calendar3 text-[#3498DB] text-xl" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-[#2C3E50]">
            {readOnly ? 'Schedule Overview' : 'Schedule Management'}
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            {readOnly ? 'Current class timetable and room assignments.' : 'Manage class timetables, batch assignments, and room allocations.'}
          </p>
        </div>
        {!readOnly && (
          <Button variant="primary" size="md">
            <i className="bi bi-plus-lg mr-1.5" aria-hidden="true" />Add Schedule
          </Button>
        )}
      </div>
      <Card className="border-[#E1EFF7] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4FAFD] border-b border-[#E1EFF7] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-5">Day</th>
                <th className="py-3 px-5">Time</th>
                <th className="py-3 px-5">Subject</th>
                <th className="py-3 px-5">Instructor</th>
                <th className="py-3 px-5">Room</th>
                <th className="py-3 px-5">Batch</th>
                {!readOnly && <th className="py-3 px-5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F6FA] text-xs">
              {schedule.map((s, i) => (
                <tr key={i} className="hover:bg-[#FAFDFE]">
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${dayColors[s.day] ?? 'bg-gray-50 text-gray-600'}`}>
                      {s.day}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-[#2C3E50]">{s.time}</td>
                  <td className="py-3.5 px-5 font-semibold text-[#2C3E50]">{s.subject}</td>
                  <td className="py-3.5 px-5 text-[#64748B]">{s.instructor}</td>
                  <td className="py-3.5 px-5 text-[#64748B]">{s.room}</td>
                  <td className="py-3.5 px-5">
                    <span className="text-[11px] font-bold bg-[#D6ECFA] text-[#2980B9] px-2 py-0.5 rounded">{s.batch}</span>
                  </td>
                  {!readOnly && (
                    <td className="py-3.5 px-5 text-right">
                      <button className="text-[#3498DB] hover:text-[#2980B9] text-xs font-semibold cursor-pointer">
                        <i className="bi bi-pencil mr-1" aria-hidden="true" />Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ── Shared: Reports page ───────────────────────────────────────
const ReportsPage: React.FC<{ showAnalytics?: boolean }> = ({ showAnalytics = false }) => {
  const stats = [
    { label: 'Total Enrolled Students', value: '1,247', icon: 'bi-people-fill',           delta: '+48 this month',   color: '#3498DB' },
    { label: 'Avg. Mock Exam Score',    value: '82.4%',  icon: 'bi-graph-up-arrow',         delta: '+3.1% vs last month', color: '#10B981' },
    { label: 'Revenue (Oct 2026)',      value: '₱2.4M',  icon: 'bi-cash-coin',             delta: '↑ 12% MoM',        color: '#7C3AED' },
    { label: 'Pending Payments',        value: '38',     icon: 'bi-exclamation-circle-fill',delta: '↓ 5 resolved today', color: '#F59E0B' },
  ];
  const topSubjects = [
    { subject: 'Applied Mathematics', passRate: 91, students: 312 },
    { subject: 'Constitutional Law',  passRate: 88, students: 287 },
    { subject: 'Fluid Mechanics',     passRate: 76, students: 198 },
    { subject: 'Organic Chemistry',   passRate: 71, students: 165 },
    { subject: 'Thermodynamics',      passRate: 69, students: 143 },
  ];
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-2xl border border-[#E1EFF7] flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#D6ECFA] flex items-center justify-center shrink-0">
          <i className={`${showAnalytics ? 'bi bi-graph-up' : 'bi bi-file-earmark-bar-graph'} text-[#3498DB] text-xl`} aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#2C3E50]">{showAnalytics ? 'Analytics' : 'Reports'}</h1>
          <p className="text-sm text-[#64748B] mt-1">
            {showAnalytics ? 'Deep-dive performance analytics across all departments.' : 'Operational and academic reports for Meliora Learning Hub.'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-[#E1EFF7]">
            <CardBody className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#64748B]">{s.label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + '20' }}>
                  <i className={`${s.icon} text-sm`} style={{ color: s.color }} aria-hidden="true" />
                </div>
              </div>
              <div className="text-2xl font-extrabold font-mono text-[#2C3E50]">{s.value}</div>
              <div className="text-[11px] text-[#64748B] mt-1">{s.delta}</div>
            </CardBody>
          </Card>
        ))}
      </div>
      <Card className="border-[#E1EFF7]">
        <CardHeader title="Subject Pass Rate Overview" subtitle="Based on diagnostic mock examinations — Oct 2026" />
        <CardBody className="p-5 space-y-4">
          {topSubjects.map((s) => (
            <div key={s.subject}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[#2C3E50]">{s.subject}</span>
                <div className="flex items-center gap-3 text-[#64748B]">
                  <span>{s.students} students</span>
                  <span className="font-bold text-[#2C3E50]">{s.passRate}%</span>
                </div>
              </div>
              <ProgressBar
                value={s.passRate}
                color={s.passRate >= 85 ? 'bg-emerald-500' : s.passRate >= 75 ? 'bg-[#3498DB]' : 'bg-amber-500'}
                size="sm"
              />
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
};

// ── Proctor: Student Performance ───────────────────────────────
const StudentPerformancePage: React.FC = () => {
  const students = sampleEnrolledStudents;
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-2xl border border-[#E1EFF7] flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#D6ECFA] flex items-center justify-center shrink-0">
          <i className="bi bi-graph-up-arrow text-[#3498DB] text-xl" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#2C3E50]">Student Performance</h1>
          <p className="text-sm text-[#64748B] mt-1">Track academic progress, scores, and exam readiness across all students.</p>
        </div>
      </div>
      <Card className="border-[#E1EFF7]">
        <CardHeader title="Academic Progress Overview" subtitle={`${students.length} enrolled students`} />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F4FAFD] border-b border-[#E1EFF7] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-5">Student</th>
                <th className="py-3 px-5">Package</th>
                <th className="py-3 px-5">Batch</th>
                <th className="py-3 px-5 min-w-[160px]">Academic Progress</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F6FA]">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-[#FAFDFE]">
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-[#2C3E50]">{s.name}</div>
                    <div className="text-[#64748B]">{s.email}</div>
                  </td>
                  <td className="py-3.5 px-5 text-[#2C3E50] font-medium">{s.packageTitle}</td>
                  <td className="py-3.5 px-5 text-[#64748B]">{s.batch}</td>
                  <td className="py-3.5 px-5">
                    <ProgressBar value={s.academicProgress} showPercent size="sm"
                      color={s.academicProgress >= 70 ? 'bg-emerald-500' : 'bg-[#3498DB]'} />
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                      s.academicProgress >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      s.academicProgress >= 50 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {s.academicProgress >= 80 ? 'On Track' : s.academicProgress >= 50 ? 'Progressing' : 'Needs Attention'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ── Manager: Settings page ─────────────────────────────────────
const SettingsPage: React.FC = () => {
  const sections = [
    { icon: 'bi-palette', label: 'Branding & Appearance', desc: 'Logo, colors, and platform name.' },
    { icon: 'bi-envelope-at', label: 'Email & Notifications', desc: 'SMTP settings and notification templates.' },
    { icon: 'bi-shield-lock', label: 'Security & Access', desc: 'Password policy, session timeout, 2FA.' },
    { icon: 'bi-globe', label: 'Localization', desc: 'Language, timezone, and currency settings.' },
    { icon: 'bi-credit-card-2-front', label: 'Payment Gateways', desc: 'GCash, Maya, card processor keys.' },
    { icon: 'bi-robot', label: 'AI Configuration', desc: 'Gemini API key, model selection, rate limits.' },
  ];
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-2xl border border-[#E1EFF7] flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#D6ECFA] flex items-center justify-center shrink-0">
          <i className="bi bi-gear-fill text-[#3498DB] text-xl" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#2C3E50]">System Settings</h1>
          <p className="text-sm text-[#64748B] mt-1">Configure platform-wide settings and integrations.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((s) => (
          <button key={s.label} className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-[#E1EFF7] hover:border-[#3498DB] hover:shadow-sm transition-all cursor-pointer text-left group">
            <div className="w-11 h-11 rounded-xl bg-[#F4FAFD] group-hover:bg-[#D6ECFA] flex items-center justify-center transition-colors shrink-0">
              <i className={`${s.icon} text-[#3498DB] text-xl`} aria-hidden="true" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#2C3E50]">{s.label}</div>
              <div className="text-xs text-[#64748B] mt-0.5">{s.desc}</div>
            </div>
            <i className="bi bi-chevron-right text-[#D6ECFA] ml-auto" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Manager: Backup & Restore ──────────────────────────────────
const BackupPage: React.FC<{ onShowToast: PortalPageProps['onShowToast'] }> = ({ onShowToast }) => {
  const backups = [
    { id: 'bak-001', label: 'Daily Snapshot',    date: 'Nov 1, 2026 – 02:00 AM', size: '142 MB', status: 'Completed' },
    { id: 'bak-002', label: 'Weekly Full Backup', date: 'Oct 26, 2026 – 01:00 AM', size: '891 MB', status: 'Completed' },
    { id: 'bak-003', label: 'Daily Snapshot',    date: 'Oct 31, 2026 – 02:00 AM', size: '139 MB', status: 'Completed' },
  ];
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-2xl border border-[#E1EFF7] flex items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D6ECFA] flex items-center justify-center shrink-0">
            <i className="bi bi-cloud-arrow-up text-[#3498DB] text-xl" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#2C3E50]">Backup & Restore</h1>
            <p className="text-sm text-[#64748B] mt-1">Manage system snapshots and disaster recovery.</p>
          </div>
        </div>
        <Button variant="primary" size="md" onClick={() => onShowToast('Backup Started', 'Manual snapshot is being created.', 'info')}>
          <i className="bi bi-cloud-upload mr-1.5" aria-hidden="true" />Run Backup Now
        </Button>
      </div>
      <Card className="border-[#E1EFF7]">
        <CardHeader title="Backup History" subtitle="Recent automated and manual snapshots" />
        <CardBody className="p-5 space-y-3">
          {backups.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-[#F4FAFD] border border-[#E1EFF7]">
              <div className="flex items-center gap-3">
                <i className="bi bi-archive-fill text-[#3498DB] text-lg" aria-hidden="true" />
                <div>
                  <div className="text-sm font-bold text-[#2C3E50]">{b.label}</div>
                  <div className="text-xs text-[#64748B]">{b.date} · {b.size}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <i className="bi bi-check-circle mr-1" aria-hidden="true" />{b.status}
                </span>
                <Button variant="secondary" size="sm" onClick={() => onShowToast('Restore Started', `Restoring from ${b.label}`, 'info')}>
                  Restore
                </Button>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
};

// ── Main router ────────────────────────────────────────────────
export const PortalPage: React.FC<PortalPageProps> = ({
  page, user, onNavigate, onShowToast,
  packages, lessons, transactions,
  onAddLesson, onAddPackage, onUpdatePackage, onDeletePackage,
  onVerifyTransaction, onEnrollComplete,
}) => {
  // Check permission silently — no technical strings exposed to user
  const reqPerm = PAGE_PERMISSIONS[page];
  if (reqPerm && !hasPermission(user, reqPerm)) return <AccessDenied />;

  const pkg  = packages  ?? reviewPackages;
  const les  = lessons   ?? sampleLessons;
  const txns = transactions ?? samplePaymentTransactions;

  // ── Student pages ────────────────────────────────────────────
  if (page === 'student-profile')       return <ProfilePage user={user} />;
  if (page === 'student-packages')      return <PackagesPage onNavigate={onNavigate} onShowToast={onShowToast} packages={pkg} />;
  if (page === 'student-enrollment' || page === 'student-payment')
    return <StudentEnrollmentPage onNavigate={onNavigate} onShowToast={onShowToast} packages={pkg} onEnrollComplete={onEnrollComplete ?? (() => {})} />;
  if (page === 'student-lessons')       return <LessonsPage onNavigate={onNavigate} onShowToast={onShowToast} />;
  if (page === 'student-mock-exam')     return <QuizPage onNavigate={onNavigate} onShowToast={onShowToast} mode="mock" />;
  if (page === 'student-certificates')  return <CertificatesPage onNavigate={onNavigate} onShowToast={onShowToast} />;
  if (page === 'student-announcements') return <AnnouncementsPage role="student" userName={user.name} />;

  // ── Front Desk pages ─────────────────────────────────────────
  if (page === 'frontdesk-dashboard')
    return <AdminDashboard onNavigate={onNavigate} onShowToast={onShowToast} visibleTabs={['roster','payments']}
             pageTitle="Front Desk Dashboard" pageSubtitle="Daily overview of enrollments, payments, and student inquiries."
             transactions={txns} onVerifyPaymentTransaction={onVerifyTransaction} />;
  if (page === 'frontdesk-students')
    return <AdminDashboard onNavigate={onNavigate} onShowToast={onShowToast} visibleTabs={['roster']}
             pageTitle="Student Management" pageSubtitle="Register, search, and manage student records." />;
  if (page === 'frontdesk-enrollment')
    return <StudentEnrollmentPage onNavigate={onNavigate} onShowToast={onShowToast} packages={pkg} onEnrollComplete={onEnrollComplete ?? (() => {})} />;
  if (page === 'frontdesk-payments')
    return <AdminDashboard onNavigate={onNavigate} onShowToast={onShowToast} visibleTabs={['payments']}
             pageTitle="Payment Management" pageSubtitle="Record and verify tuition payments across all channels."
             transactions={txns} onVerifyPaymentTransaction={onVerifyTransaction} />;
  if (page === 'frontdesk-schedule')    return <SchedulePage readOnly={false} />;
  if (page === 'frontdesk-reports')     return <ReportsPage />;
  if (page === 'frontdesk-announcements') return <AnnouncementsPage role="frontdesk" userName={user.name} />;
  if (page === 'frontdesk-profile')     return <ProfilePage user={user} />;

  // ── Proctor pages ─────────────────────────────────────────────
  if (page === 'proctor-dashboard')
    return <AdminDashboard onNavigate={onNavigate} onShowToast={onShowToast} visibleTabs={['lessons']}
             pageTitle="Proctor Dashboard" pageSubtitle="Overview of active lessons, quizzes, and student performance."
             lessons={les} onAddLesson={onAddLesson} />;
  if (page === 'proctor-lessons')
    return <AdminDashboard onNavigate={onNavigate} onShowToast={onShowToast} visibleTabs={['lessons']}
             pageTitle="Lesson Management" pageSubtitle="Create, edit, and publish lesson content and PDF materials."
             lessons={les} onAddLesson={onAddLesson} />;
  if (page === 'proctor-quiz')
    return <QuizManagerPage onShowToast={onShowToast} />;
  if (page === 'proctor-mock-exam')
    return <MockExamManagerPage onShowToast={onShowToast} />;  if (page === 'proctor-performance')   return <StudentPerformancePage />;
  if (page === 'proctor-announcements') return <AnnouncementsPage role="proctor" userName={user.name} />;
  if (page === 'proctor-profile')       return <ProfilePage user={user} />;

  // ── Manager pages ─────────────────────────────────────────────
  if (page === 'manager-dashboard')
    return <AdminDashboard onNavigate={onNavigate} onShowToast={onShowToast}
             pageTitle="Manager Dashboard" pageSubtitle="High-level KPI overview across all departments."
             packages={pkg} lessons={les} transactions={txns}
             onAddPackage={onAddPackage} onUpdatePackage={onUpdatePackage} onDeletePackage={onDeletePackage}
             onAddLesson={onAddLesson} onVerifyPaymentTransaction={onVerifyTransaction} />;
  if (page === 'manager-students')
    return <AdminDashboard onNavigate={onNavigate} onShowToast={onShowToast} visibleTabs={['roster']}
             pageTitle="Student Management" pageSubtitle="Full visibility and control over all student records." />;
  if (page === 'manager-packages')
    return <AdminDashboard onNavigate={onNavigate} onShowToast={onShowToast} visibleTabs={['packages']}
             pageTitle="Review Package Management" pageSubtitle="Develop, publish, archive, and configure review packages."
             packages={pkg} onAddPackage={onAddPackage} onUpdatePackage={onUpdatePackage} onDeletePackage={onDeletePackage} />;
  if (page === 'manager-enrollment')
    return <AdminDashboard onNavigate={onNavigate} onShowToast={onShowToast} visibleTabs={['roster','payments']}
             pageTitle="Enrollment Monitoring" pageSubtitle="Monitor enrollment volumes, batch fill rates, and trends."
             transactions={txns} onVerifyPaymentTransaction={onVerifyTransaction} />;
  if (page === 'manager-payments')
    return <AdminDashboard onNavigate={onNavigate} onShowToast={onShowToast} visibleTabs={['payments']}
             pageTitle="Payment Monitoring" pageSubtitle="Track revenue, pending payments, and reconciliation."
             transactions={txns} onVerifyPaymentTransaction={onVerifyTransaction} />;
  if (page === 'manager-schedule')      return <SchedulePage readOnly={false} />;
  if (page === 'manager-reports')       return <ReportsPage />;
  if (page === 'manager-analytics')     return <ReportsPage showAnalytics />;
  if (page === 'manager-settings')      return <SettingsPage />;
  if (page === 'manager-backup')        return <BackupPage onShowToast={onShowToast} />;
  if (page === 'manager-announcements') return <AnnouncementsPage role="manager" userName={user.name} />;
  if (page === 'manager-profile')       return <ProfilePage user={user} />;

  // Fallback — should never reach here given RBAC guards
  return <AccessDenied />;
};

// ── Inline: Proctor Quiz Manager ───────────────────────────────
const QuizManagerPage: React.FC<{ onShowToast: PortalPageProps['onShowToast'] }> = ({ onShowToast }) => {
  const [search, setSearch] = useState('');
  const questions = sampleLessons.map((l, i) => ({
    id: `q-${i+1}`, subject: l.subject, count: 12 + i * 3,
    difficulty: i % 3 === 0 ? 'Easy' : i % 3 === 1 ? 'Moderate' : 'Challenging',
    lastUpdated: 'Oct 2026',
  }));
  const filtered = questions.filter((q) => q.subject.toLowerCase().includes(search.toLowerCase()));
  const diffColor: Record<string, string> = { Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200', Moderate: 'bg-amber-50 text-amber-700 border-amber-200', Challenging: 'bg-red-50 text-red-600 border-red-200' };
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-2xl border border-[#E1EFF7] flex items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D6ECFA] flex items-center justify-center shrink-0">
            <i className="bi bi-patch-question text-[#3498DB] text-xl" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#2C3E50]">Quiz Management</h1>
            <p className="text-sm text-[#64748B] mt-1">Build and manage question banks per subject domain.</p>
          </div>
        </div>
        <Button variant="primary" size="md" onClick={() => onShowToast('Question Bank', 'Opening question builder...', 'info')}>
          <i className="bi bi-plus-lg mr-1.5" aria-hidden="true" />Add Question Set
        </Button>
      </div>
      <div className="relative max-w-md">
        <i className="bi bi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true" />
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by subject…"
          className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[#D6ECFA] focus:outline-none focus:ring-2 focus:ring-[#3498DB] bg-white" />
      </div>
      <Card className="border-[#E1EFF7]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F4FAFD] border-b border-[#E1EFF7] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-5">Subject Domain</th>
                <th className="py-3 px-5">Questions</th>
                <th className="py-3 px-5">Difficulty</th>
                <th className="py-3 px-5">Last Updated</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F6FA]">
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-[#FAFDFE]">
                  <td className="py-3.5 px-5 font-semibold text-[#2C3E50]">{q.subject}</td>
                  <td className="py-3.5 px-5 font-mono text-[#2C3E50]">{q.count} items</td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${diffColor[q.difficulty]}`}>{q.difficulty}</span>
                  </td>
                  <td className="py-3.5 px-5 text-[#64748B]">{q.lastUpdated}</td>
                  <td className="py-3.5 px-5 text-right">
                    <Button variant="secondary" size="sm" onClick={() => onShowToast('Edit Questions', `Opening ${q.subject} question bank`, 'info')}>
                      <i className="bi bi-pencil mr-1" aria-hidden="true" />Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ── Inline: Proctor Mock Exam Manager ─────────────────────────
const MockExamManagerPage: React.FC<{ onShowToast: PortalPageProps['onShowToast'] }> = ({ onShowToast }) => {
  const exams = [
    { id: 'ex-1', title: 'Diagnostic Mock Exam 1', date: 'Nov 2, 2026', duration: '4 hours', takers: 248, avg: '78.4%', status: 'Scheduled' },
    { id: 'ex-2', title: 'Diagnostic Mock Exam 2', date: 'Nov 9, 2026', duration: '4 hours', takers: 0,   avg: '—',     status: 'Draft' },
    { id: 'ex-3', title: 'Full PRC Simulation',    date: 'Oct 18, 2026', duration: '5 hours', takers: 231, avg: '82.1%', status: 'Completed' },
  ];
  const statusColors: Record<string, string> = {
    Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    Draft:     'bg-gray-50 text-gray-600 border-gray-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="bg-white p-6 rounded-2xl border border-[#E1EFF7] flex items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D6ECFA] flex items-center justify-center shrink-0">
            <i className="bi bi-file-earmark-ruled text-[#3498DB] text-xl" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#2C3E50]">Mock Exam Management</h1>
            <p className="text-sm text-[#64748B] mt-1">Schedule, configure, and review full-length mock examinations.</p>
          </div>
        </div>
        <Button variant="primary" size="md" onClick={() => onShowToast('New Exam', 'Opening exam builder...', 'info')}>
          <i className="bi bi-plus-lg mr-1.5" aria-hidden="true" />Create Mock Exam
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {exams.map((e) => (
          <Card key={e.id} className="border-[#E1EFF7]">
            <CardBody className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusColors[e.status]}`}>{e.status}</span>
                <span className="text-[11px] text-[#64748B]">{e.duration}</span>
              </div>
              <h3 className="text-sm font-bold text-[#2C3E50]">{e.title}</h3>
              <div className="text-xs text-[#64748B] space-y-1">
                <div><i className="bi bi-calendar3 mr-1" aria-hidden="true" />{e.date}</div>
                <div><i className="bi bi-people mr-1" aria-hidden="true" />{e.takers} takers · Avg: {e.avg}</div>
              </div>
              <Button variant="secondary" size="sm" className="w-full justify-center"
                onClick={() => onShowToast('Exam Details', `Opening ${e.title}`, 'info')}>
                {e.status === 'Completed' ? 'View Results' : 'Edit Exam'}
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
