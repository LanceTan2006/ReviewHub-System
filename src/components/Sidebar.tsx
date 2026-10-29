import React from 'react';
import { ActivePage, UserRole } from '../types';
import {
  LayoutDashboard,
  Package,
  BookOpen,
  Sparkles,
  HelpCircle,
  FileCheck2,
  TrendingUp,
  Award,
  User,
  LogOut,
  Users,
  CreditCard,
  Calendar,
  BarChart3,
  Settings,
  GraduationCap,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  currentPage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  role: UserRole;
  onLogout: () => void;
  studentName?: string;
  avatarUrl?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  role,
  onLogout,
  studentName = 'Alyssa Reyes',
  avatarUrl = '/src/assets/images/avatar_student_meliora_1793090026459.jpg',
}) => {
  const isStudent = role === 'student';

  const studentNavItems = [
    { id: 'student-dashboard' as ActivePage, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'student-packages' as ActivePage, label: 'My Review Package', icon: <Package className="w-5 h-5" /> },
    { id: 'student-lessons' as ActivePage, label: 'Lessons', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'ai-reviewer' as ActivePage, label: 'AI Reviewer', icon: <Sparkles className="w-5 h-5 text-[#3498DB]" /> },
    { id: 'quiz' as ActivePage, label: 'Quiz & IELTS Band Drill', icon: <HelpCircle className="w-5 h-5" /> },
    { id: 'student-enrollment' as ActivePage, label: 'Enroll / Pay Tuition', icon: <CreditCard className="w-5 h-5 text-emerald-600" /> },
    { id: 'student-progress' as ActivePage, label: 'Progress', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'student-certificates' as ActivePage, label: 'Certificates', icon: <Award className="w-5 h-5" /> },
  ];

  const adminNavItems = [
    { id: 'admin-dashboard' as ActivePage, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'admin-students' as ActivePage, label: 'Students', icon: <Users className="w-5 h-5" /> },
    { id: 'admin-packages' as ActivePage, label: 'Review Packages', icon: <Package className="w-5 h-5" /> },
    { id: 'admin-lessons' as ActivePage, label: 'Generate Lessons', icon: <BookOpen className="w-5 h-5 text-[#3498DB]" /> },
    { id: 'admin-payments' as ActivePage, label: 'Payments & Ledger', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'admin-schedule' as ActivePage, label: 'Schedule', icon: <Calendar className="w-5 h-5" /> },
    { id: 'admin-reports' as ActivePage, label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const navItems = isStudent ? studentNavItems : adminNavItems;

  return (
    <aside className="w-64 bg-[#D6ECFA]/50 border-r border-[#CFE5F5] flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
      {/* Top Brand Header */}
      <div>
        <div className="p-5 border-b border-[#BFDDF2] flex items-center justify-between">
          <div
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#3498DB] text-white flex items-center justify-center shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold text-[#2C3E50] tracking-tight leading-tight">
                ReviewHub
              </div>
              <div className="text-[10px] text-[#3498DB] font-semibold tracking-wider uppercase">
                {isStudent ? 'Student Space' : 'Admin Console'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
            {isStudent ? 'Learning Menu' : 'Staff Operations'}
          </div>
          {navItems.map((item, index) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={`${item.id}-${index}`}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#2980B9] shadow-xs font-semibold'
                    : 'text-[#2C3E50] hover:bg-white/60 hover:text-[#3498DB]'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <span className={`${isActive ? 'text-[#3498DB]' : 'text-[#64748B]'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-[#3498DB]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Profile & Role Actions */}
      <div className="p-4 border-t border-[#BFDDF2] bg-white/40 space-y-3">
        {/* User Card */}
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/70 border border-[#D6ECFA]">
          <img
            src={isStudent ? avatarUrl : '/src/assets/images/avatar_student_meliora_1793090026459.jpg'}
            alt="User profile"
            className="w-10 h-10 rounded-full object-cover border border-[#5DADE2] shrink-0"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#2C3E50] truncate">
              {isStudent ? studentName : 'Administrator Lim'}
            </p>
            <p className="text-[11px] text-[#64748B] truncate">
              {isStudent ? 'PRC Board Batch Alpha' : 'Operations Lead'}
            </p>
          </div>
        </div>

        {/* Quick Demo Switcher & Logout */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onNavigate(isStudent ? 'admin-dashboard' : 'student-dashboard')}
            className="flex-1 text-[11px] font-semibold text-[#3498DB] hover:text-[#2980B9] bg-white py-1.5 px-2 rounded-lg border border-[#D6ECFA] text-center truncate cursor-pointer"
            title="Switch demo mode"
          >
            Switch to {isStudent ? 'Admin' : 'Student'}
          </button>
          <button
            onClick={onLogout}
            className="p-1.5 text-[#64748B] hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
