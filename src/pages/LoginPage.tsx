/**
 * LoginPage — Authentication with 4-role selector.
 * No role selection at runtime login (roles come from the user record).
 * Credentials are verified against MOCK_USERS in rbac.ts.
 * On success, onLoginSuccess receives the full AuthUser object.
 */
import React, { useState } from 'react';
import { ActivePage } from '../types';
import { AuthUser, authenticateUser, MOCK_USERS } from '../rbac';
import { Card, CardBody } from '../components/Card';
import { Button } from '../components/Button';
import {
  ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle,
} from 'lucide-react';
import logoImg from '../assets/images/reviewhub_logo.png';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
  onNavigate: (page: ActivePage) => void;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

// ── Password rules (enforced on Register only) ─────────────────
interface PwRule { label: string; test: (pw: string) => boolean; }
const PW_RULES: PwRule[] = [
  { label: 'At least 8 characters',                test: (pw) => pw.length >= 8 },
  { label: 'At least 1 uppercase letter (A–Z)',    test: (pw) => /[A-Z]/.test(pw) },
  { label: 'At least 1 lowercase letter (a–z)',    test: (pw) => /[a-z]/.test(pw) },
  { label: 'At least 1 number (0–9)',               test: (pw) => /[0-9]/.test(pw) },
  { label: 'At least 1 special character (!@#$…)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function strengthLabel(n: number): { label: string; color: string } {
  if (n <= 1) return { label: 'Very Weak',  color: '#EF4444' };
  if (n === 2) return { label: 'Weak',       color: '#F97316' };
  if (n === 3) return { label: 'Fair',       color: '#EAB308' };
  if (n === 4) return { label: 'Strong',     color: '#22C55E' };
  return              { label: 'Very Strong', color: '#10B981' };
}

// Demo credential rows shown on the login card
const DEMO_ROWS = [
  { role: 'Student',    email: 'alyssa.reyes@univ.edu.ph',        password: 'Student@123',   icon: 'bi-mortarboard',         color: '#3498DB' },
  { role: 'Front Desk', email: 'maria.santos@meliorahub.edu.ph',   password: 'FrontDesk@123', icon: 'bi-person-badge',        color: '#10B981' },
  { role: 'Proctor',    email: 'r.delgado@meliorahub.edu.ph',      password: 'Proctor@123',   icon: 'bi-journal-check',       color: '#F59E0B' },
  { role: 'Manager',    email: 'c.lim@meliorahub.edu.ph',          password: 'Manager@123',   icon: 'bi-shield-fill-check',   color: '#7C3AED' },
  { role: 'Multi-Role', email: 'j.bautista@meliorahub.edu.ph',     password: 'MultiRole@123', icon: 'bi-person-lines-fill',   color: '#EC4899' },
];

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigate,
  onShowToast,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [name, setName]             = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [showPw, setShowPw]         = useState(false);
  const [showCPw, setShowCPw]       = useState(false);
  const [pwTouched, setPwTouched]   = useState(false);
  const [formError, setFormError]   = useState('');
  const [showDemo, setShowDemo]     = useState(false);

  // Password strength
  const passed   = PW_RULES.filter((r) => r.test(password));
  const strength = strengthLabel(passed.length);
  const allOk    = passed.length === PW_RULES.length;

  // Pre-fill credentials from demo table
  const fillDemo = (row: typeof DEMO_ROWS[0]) => {
    setEmail(row.email);
    setPassword(row.password);
    setIsRegister(false);
    setFormError('');
    setPwTouched(false);
    setShowDemo(false);
  };

  const handleToggleMode = (toRegister: boolean) => {
    setIsRegister(toRegister);
    setPassword(''); setConfirmPw('');
    setPwTouched(false); setFormError('');
    if (!toRegister) setEmail('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (isRegister) {
      if (!allOk)              { setFormError('Password does not meet all requirements.'); setPwTouched(true); return; }
      if (password !== confirmPw) { setFormError('Passwords do not match.'); return; }
      // Simulate registration success (no real DB in demo)
      onShowToast('Account Created!', 'You can now sign in with your credentials.', 'success');
      setIsRegister(false);
      setPassword(''); setConfirmPw('');
      return;
    }

    // ── Login ────────────────────────────────────────────────
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user = authenticateUser(email, password);
      if (!user) {
        setFormError('Invalid email or password. Please check your credentials or use a demo account below.');
        return;
      }
      onShowToast(
        `Welcome, ${user.name}!`,
        `Signed in as ${user.roles.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(' + ')}`,
        'success'
      );
      onLoginSuccess(user);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#F4FAFD] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-[#D6ECFA]/70 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#5DADE2]/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

      {/* Back link */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#3498DB] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Landing Page
        </button>
        <span className="text-xs text-[#94A3B8]">Meliora Learning Hub</span>
      </div>

      <div className="w-full max-w-md">
        <Card className="border-[#D6ECFA] shadow-lg">
          <CardBody className="p-8">

            {/* Logo */}
            <div className="text-center mb-6">
              <img
                src={logoImg}
                alt="ReviewHub"
                className="h-12 w-auto object-contain mx-auto mb-3"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <h1 className="text-2xl font-extrabold text-[#2C3E50] tracking-tight">ReviewHub</h1>
              <p className="text-xs font-semibold text-[#3498DB] mt-0.5 uppercase tracking-widest">
                Meliora Learning Hub
              </p>
              <p className="text-xs text-[#64748B] mt-2">
                {isRegister ? 'Create your account to get started' : 'Sign in to access your portal'}
              </p>
            </div>

            {/* ── RBAC info strip ── */}
            {!isRegister && (
              <div className="mb-5 p-3 rounded-xl bg-[#F4FAFD] border border-[#D6ECFA] flex items-start gap-2.5">
                <i className="bi bi-shield-lock text-[#3498DB] text-base shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-[11px] text-[#64748B] leading-relaxed">
                  <strong className="text-[#2C3E50]">Role-Based Access:</strong> Your access is determined by the roles assigned to your account — not selected at login. Contact your Manager to update role assignments.
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Full Name — register only */}
              {isRegister && (
                <div>
                  <label htmlFor="auth-name" className="block text-xs font-semibold text-[#2C3E50] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alyssa Reyes"
                    autoComplete="name"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D6ECFA] focus:outline-none focus:ring-2 focus:ring-[#3498DB] bg-[#FAFDFE]"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="auth-email" className="block text-xs font-semibold text-[#2C3E50] mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <i className="bi bi-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true" />
                  <input
                    id="auth-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@meliorahub.edu.ph"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#D6ECFA] focus:outline-none focus:ring-2 focus:ring-[#3498DB] bg-[#FAFDFE]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="auth-password" className="text-xs font-semibold text-[#2C3E50]">
                    Password <span className="text-red-500">*</span>
                  </label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => onShowToast('Password Reset', 'A reset link has been sent to your email.', 'info')}
                      className="text-xs text-[#3498DB] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <i className="bi bi-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true" />
                  <input
                    id="auth-password"
                    type={showPw ? 'text' : 'password'}
                    required
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPwTouched(true); }}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-[#D6ECFA] focus:outline-none focus:ring-2 focus:ring-[#3498DB] bg-[#FAFDFE]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#64748B] cursor-pointer"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength meter + checklist (register only) */}
                {isRegister && pwTouched && password.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[#E1EFF7] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${(passed.length / PW_RULES.length) * 100}%`, backgroundColor: strength.color }}
                        />
                      </div>
                      <span className="text-[11px] font-bold" style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                    <ul className="space-y-1">
                      {PW_RULES.map((rule) => {
                        const ok = rule.test(password);
                        return (
                          <li key={rule.label} className="flex items-center gap-1.5">
                            {ok
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              : <XCircle      className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            }
                            <span className={`text-[11px] ${ok ? 'text-emerald-600' : 'text-red-500'}`}>{rule.label}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm Password — register only */}
              {isRegister && (
                <div>
                  <label htmlFor="auth-confirm" className="block text-xs font-semibold text-[#2C3E50] mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <i className="bi bi-lock-fill absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true" />
                    <input
                      id="auth-confirm"
                      type={showCPw ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={confirmPw}
                      onChange={(e) => setConfirmPw(e.target.value)}
                      placeholder="Re-enter your password"
                      className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-2 bg-[#FAFDFE] ${
                        confirmPw && confirmPw !== password
                          ? 'border-red-300 focus:ring-red-300'
                          : confirmPw && confirmPw === password
                          ? 'border-emerald-300 focus:ring-emerald-300'
                          : 'border-[#D6ECFA] focus:ring-[#3498DB]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCPw(!showCPw)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#94A3B8] hover:text-[#64748B] cursor-pointer"
                      aria-label={showCPw ? 'Hide password' : 'Show password'}
                    >
                      {showCPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPw && confirmPw !== password && (
                    <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1"><XCircle className="w-3 h-3" /> Passwords do not match</p>
                  )}
                  {confirmPw && confirmPw === password && (
                    <p className="mt-1 text-[11px] text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Passwords match</p>
                  )}
                </div>
              )}

              {/* Form error */}
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-start gap-2">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {formError}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading || (isRegister && (!allOk || password !== confirmPw))}
                className="w-full justify-center mt-2"
              >
                {isLoading ? 'Authenticating…' : isRegister ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            {/* Toggle mode */}
            <div className="mt-5 text-center text-xs text-[#64748B]">
              {isRegister ? (
                <>Already have an account?{' '}
                  <button type="button" onClick={() => handleToggleMode(false)} className="font-bold text-[#3498DB] hover:underline cursor-pointer">Log In</button>
                </>
              ) : (
                <>Don't have an account?{' '}
                  <button type="button" onClick={() => handleToggleMode(true)} className="font-bold text-[#3498DB] hover:underline cursor-pointer">Register here</button>
                </>
              )}
            </div>

            {/* ── Demo credentials accordion ── */}
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowDemo(!showDemo)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F4FAFD] border border-[#E1EFF7] text-xs font-semibold text-[#64748B] hover:text-[#2C3E50] cursor-pointer transition-colors"
                aria-expanded={showDemo}
              >
                <span className="flex items-center gap-1.5">
                  <i className="bi bi-people-fill text-[#3498DB]" aria-hidden="true" />
                  Demo Accounts — Click to Auto-Fill
                </span>
                <i className={`bi bi-chevron-${showDemo ? 'up' : 'down'} text-[#94A3B8]`} aria-hidden="true" />
              </button>

              {showDemo && (
                <div className="mt-2 border border-[#E1EFF7] rounded-xl overflow-hidden">
                  {DEMO_ROWS.map((row, i) => (
                    <button
                      key={row.email}
                      type="button"
                      onClick={() => fillDemo(row)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F4FAFD] transition-colors cursor-pointer ${
                        i < DEMO_ROWS.length - 1 ? 'border-b border-[#F0F6FA]' : ''
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shrink-0"
                        style={{ backgroundColor: row.color }}
                        aria-hidden="true"
                      >
                        <i className={row.icon} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-[#2C3E50]">{row.role}</div>
                        <div className="text-[11px] text-[#64748B] truncate">{row.email}</div>
                      </div>
                      <code className="text-[10px] font-mono text-[#94A3B8] hidden sm:block shrink-0">{row.password}</code>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </CardBody>
        </Card>
      </div>
    </div>
  );
};
