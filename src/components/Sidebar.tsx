import React from 'react';
import { ActivePage, UserRole } from '../types';
import logoImg from '../assets/images/reviewhub_logo.png';

interface SidebarProps {
  currentPage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  role: UserRole;
  onLogout: () => void;
  userName?: string;
  userEmail?: string;
}

// ── Nav item definition ────────────────────────────────────────
interface NavItem {
  id: ActivePage;
  label: string;
  icon: string;        // Bootstrap Icon class e.g. "bi-speedometer2"
  section?: string;    // Optional group heading
}

// ── Role metadata ──────────────────────────────────────────────
const ROLE_META: Record<UserRole, { label: string; color: string; badge: string; bgClass: string }> = {
  guest:     { label: 'Guest',         color: '#64748B', badge: 'bg-gray-100 text-gray-600 border-gray-200',     bgClass: 'bg-gray-50' },
  student:   { label: 'Student',       color: '#3498DB', badge: 'bg-blue-50 text-blue-700 border-blue-200',      bgClass: 'bg-blue-50' },
  frontdesk: { label: 'Front Desk',    color: '#10B981', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', bgClass: 'bg-emerald-50' },
  proctor:   { label: 'Proctor',       color: '#F59E0B', badge: 'bg-amber-50 text-amber-700 border-amber-200',   bgClass: 'bg-amber-50' },
  manager:   { label: 'Manager',       color: '#7C3AED', badge: 'bg-purple-50 text-purple-700 border-purple-200', bgClass: 'bg-purple-50' },
};

// ── Nav definitions per role ───────────────────────────────────
const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  guest: [],

  student: [
    { id: 'student-dashboard',    label: 'Dashboard',         icon: 'bi-speedometer2',      section: 'Main' },
    { id: 'student-profile',      label: 'My Profile',        icon: 'bi-person-circle' },
    { id: 'student-packages',     label: 'Review Packages',   icon: 'bi-collection',        section: 'Learning' },
    { id: 'student-enrollment',   label: 'My Enrollment',     icon: 'bi-clipboard-check' },
    { id: 'student-lessons',      label: 'Lessons',           icon: 'bi-play-circle' },
    { id: 'quiz',                 label: 'Practice Quiz',     icon: 'bi-question-circle' },
    { id: 'student-mock-exam',    label: 'Mock Examination',  icon: 'bi-file-earmark-text' },
    { id: 'ai-reviewer',          label: 'AI Reviewer',       icon: 'bi-stars' },
    { id: 'student-certificates', label: 'Certificates',      icon: 'bi-award',             section: 'Records' },
    { id: 'student-announcements',label: 'Announcements',     icon: 'bi-megaphone' },
  ],

  frontdesk: [
    { id: 'frontdesk-dashboard',   label: 'Dashboard',            icon: 'bi-speedometer2',   section: 'Main' },
    { id: 'manager-users',          label: 'Student Accounts',     icon: 'bi-people-fill',    section: 'Operations' },
    { id: 'frontdesk-students',    label: 'Student Management',   icon: 'bi-people',         section: 'Operations' },
    { id: 'frontdesk-enrollment',  label: 'Enrollment Management',icon: 'bi-clipboard-plus' },
    { id: 'frontdesk-payments',    label: 'Payment Management',   icon: 'bi-cash-stack' },
    { id: 'frontdesk-schedule',    label: 'Schedule Management',  icon: 'bi-calendar3' },
    { id: 'frontdesk-reports',     label: 'Reports',              icon: 'bi-bar-chart-line',  section: 'Reports' },
    { id: 'frontdesk-announcements',label: 'Announcements',       icon: 'bi-megaphone' },
    { id: 'frontdesk-profile',     label: 'My Profile',           icon: 'bi-person-circle',   section: 'Account' },
  ],

  proctor: [
    { id: 'proctor-dashboard',     label: 'Dashboard',              icon: 'bi-speedometer2',        section: 'Main' },
    { id: 'proctor-lessons',       label: 'Lesson Management',      icon: 'bi-journal-bookmark',    section: 'Academic' },
    { id: 'proctor-quiz',          label: 'Quiz Management',        icon: 'bi-patch-question' },
    { id: 'proctor-mock-exam',     label: 'Mock Exam Management',   icon: 'bi-file-earmark-ruled' },
    { id: 'proctor-performance',   label: 'Student Performance',    icon: 'bi-graph-up-arrow' },
    { id: 'proctor-announcements', label: 'Announcements',          icon: 'bi-megaphone',           section: 'Communication' },
    { id: 'proctor-profile',       label: 'My Profile',             icon: 'bi-person-circle',       section: 'Account' },
  ],

  manager: [
    { id: 'manager-dashboard',     label: 'Dashboard',           icon: 'bi-speedometer2',      section: 'Main' },
    { id: 'manager-users',         label: 'User Management',     icon: 'bi-people-fill',       section: 'Administration' },
    { id: 'manager-students',      label: 'Student Management',  icon: 'bi-mortarboard' },
    { id: 'manager-packages',      label: 'Review Packages',     icon: 'bi-collection-fill' },
    { id: 'manager-enrollment',    label: 'Enrollment Monitoring',icon: 'bi-clipboard-data' },
    { id: 'manager-payments',      label: 'Payment Monitoring',  icon: 'bi-cash-coin' },
    { id: 'manager-schedule',      label: 'Schedule Monitoring', icon: 'bi-calendar-week' },
    { id: 'manager-reports',       label: 'Reports',             icon: 'bi-file-earmark-bar-graph', section: 'Analytics' },
    { id: 'manager-analytics',     label: 'Analytics',           icon: 'bi-graph-up' },
    { id: 'manager-settings',      label: 'Settings',            icon: 'bi-gear-fill',         section: 'System' },
    { id: 'manager-backup',        label: 'Backup & Restore',    icon: 'bi-cloud-arrow-up' },
    { id: 'manager-announcements', label: 'Announcements',       icon: 'bi-megaphone',         section: 'Communication' },
    { id: 'manager-profile',       label: 'My Profile',          icon: 'bi-person-circle',     section: 'Account' },
  ],
};

// ── Sidebar Component ──────────────────────────────────────────
export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  role,
  onLogout,
  userName,
  userEmail,
}) => {
  const meta = ROLE_META[role] || ROLE_META.guest;
  const navItems = NAV_ITEMS[role] || [];

  // Derive display name / email based on role
  const displayName  = userName  || (role === 'student' ? 'Alyssa Reyes' : role === 'frontdesk' ? 'Maria Santos' : role === 'proctor' ? 'Dr. Ramon Delgado' : role === 'manager' ? 'Catherine Lim' : 'User');
  const displayEmail = userEmail || (role === 'student' ? 'alyssa.reyes@univ.edu.ph' : role === 'frontdesk' ? 'maria.santos@meliorahub.edu.ph' : role === 'proctor' ? 'r.delgado@meliorahub.edu.ph' : 'c.lim@meliorahub.edu.ph');

  // Group items by section
  let lastSection = '';

  return (
    <aside
      className="w-64 flex flex-col h-screen sticky top-0 overflow-y-auto border-r border-[#E1EFF7]"
      style={{ background: 'linear-gradient(180deg, #F8FCFF 0%, #EEF7FD 100%)' }}
      aria-label={`${meta.label} navigation sidebar`}
    >
      {/* ── Brand Header ─────────────────────────────── */}
      <div className="px-5 py-4 border-b border-[#D6ECFA] flex items-center gap-3">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3498DB] rounded-lg flex-1 min-w-0"
          aria-label="Go to landing page"
          style={{ background: 'none', border: 'none', padding: 0 }}
        >
          <img
            src={logoImg}
            alt="ReviewHub"
            className="h-8 w-auto object-contain shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="min-w-0">
            <div className="text-[11px] font-bold tracking-widest uppercase leading-none truncate"
                 style={{ color: meta.color }}>
              {meta.label} Portal
            </div>
          </div>
        </button>
      </div>

      {/* ── Navigation ───────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Sidebar navigation">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;

          return (
            <React.Fragment key={item.id}>
              {/* Section heading */}
              {showSection && (
                <div className="px-3 pt-4 pb-1.5 text-[10px] font-bold tracking-widest uppercase text-[#94A3B8]">
                  {item.section}
                </div>
              )}

              {/* Nav button */}
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer mb-0.5 group ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-[#4A6A80] hover:bg-white hover:text-[#2C3E50] hover:shadow-xs'
                }`}
                style={isActive ? { backgroundColor: meta.color } : {}}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Bootstrap Icon */}
                <i
                  className={`${item.icon} text-base leading-none shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-[#64748B] group-hover:text-[#2C3E50]'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>

                {/* Active indicator chevron */}
                {isActive && (
                  <i className="bi bi-chevron-right text-xs ml-auto opacity-75" aria-hidden="true" />
                )}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* ── User Profile Footer ───────────────────────── */}
      <div className="p-4 border-t border-[#D6ECFA] bg-white/60">
        {/* Role badge */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border mb-3 ${meta.badge}`}>
          <i className="bi bi-shield-check text-xs" aria-hidden="true" />
          {meta.label}
        </div>

        {/* User card */}
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-[#E1EFF7] mb-3">
          {/* Avatar circle with initials */}
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: meta.color }}
            aria-hidden="true"
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#2C3E50] truncate">{displayName}</p>
            <p className="text-[10px] text-[#64748B] truncate">{displayEmail}</p>
          </div>
        </div>

        {/* Log Out */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 bg-white border border-rose-100 transition-colors cursor-pointer"
          aria-label="Log out"
        >
          <i className="bi bi-box-arrow-right text-sm" aria-hidden="true" />
          Log Out
        </button>
      </div>
    </aside>
  );
};
