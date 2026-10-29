import React, { useState } from 'react';
import { ActivePage, UserRole } from '../types';
import { Card, CardBody } from '../components/Card';
import { Button } from '../components/Button';
import { GraduationCap, Lock, Mail, UserCheck, Shield, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole) => void;
  onNavigate: (page: ActivePage) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigate,
  onShowToast,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<'student' | 'admin'>('student');
  const [email, setEmail] = useState('alyssa.reyes@univ.edu.ph');
  const [password, setPassword] = useState('••••••••••');
  const [name, setName] = useState('Alyssa Reyes');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(role);
      onShowToast(
        isRegister ? 'Account Created!' : 'Welcome back!',
        `Logged in as ${role === 'student' ? 'Student: ' + (name || 'Alyssa Reyes') : 'Admin / Staff'}`,
        'success'
      );
      onNavigate(role === 'student' ? 'student-dashboard' : 'admin-dashboard');
    }, 450);
  };

  const handleQuickDemo = (targetRole: 'student' | 'admin') => {
    setRole(targetRole);
    if (targetRole === 'student') {
      setEmail('alyssa.reyes@univ.edu.ph');
      setName('Alyssa Reyes');
    } else {
      setEmail('admin.lim@meliorahub.edu.ph');
      setName('Admin Catherine Lim');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4FAFD] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-[#D6ECFA]/70 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#5DADE2]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home button */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#3498DB] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </button>
        <span className="text-xs text-[#94A3B8]">Meliora Learning Hub</span>
      </div>

      <div className="w-full max-w-md">
        <Card className="border-[#D6ECFA] shadow-lg">
          <CardBody className="p-8">
            {/* Logo and System Name at the Top */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#3498DB] to-[#5DADE2] text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-[#2C3E50] tracking-tight">ReviewHub</h2>
              <p className="text-xs font-medium text-[#3498DB] mt-0.5 uppercase tracking-wide">
                Meliora Learning Hub
              </p>
              <p className="text-xs text-[#64748B] mt-2">
                {isRegister
                  ? 'Create your learner account to start reviewing'
                  : 'Sign in to access your review packages & AI tools'}
              </p>
            </div>

            {/* Quick Demo Switcher Segment */}
            <div className="p-1 bg-[#F4FAFD] border border-[#D6ECFA] rounded-xl flex mb-6">
              <button
                type="button"
                onClick={() => handleQuickDemo('student')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  role === 'student'
                    ? 'bg-white text-[#2980B9] shadow-xs'
                    : 'text-[#64748B] hover:text-[#2C3E50]'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Student Login</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  role === 'admin'
                    ? 'bg-white text-[#2980B9] shadow-xs'
                    : 'text-[#64748B] hover:text-[#2C3E50]'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin / Staff</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-[#2C3E50] mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alyssa Reyes"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[#D6ECFA] focus:outline-none focus:ring-2 focus:ring-[#3498DB] bg-[#FAFDFE]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#2C3E50] mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@univ.edu.ph"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#D6ECFA] focus:outline-none focus:ring-2 focus:ring-[#3498DB] bg-[#FAFDFE]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#2C3E50]">Password</label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() =>
                        onShowToast(
                          'Password Reset Link Sent',
                          'Check your email inbox for security instructions.',
                          'info'
                        )
                      }
                      className="text-xs text-[#3498DB] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#D6ECFA] focus:outline-none focus:ring-2 focus:ring-[#3498DB] bg-[#FAFDFE]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                className="w-full justify-center mt-2"
              >
                {isLoading
                  ? 'Authenticating...'
                  : isRegister
                  ? 'Register ReviewHub Account'
                  : `Sign In as ${role === 'student' ? 'Student' : 'Administrator'}`}
              </Button>
            </form>

            {/* Register / Sign in toggle link */}
            <div className="mt-6 text-center text-xs text-[#64748B]">
              {isRegister ? (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegister(false)}
                    className="font-bold text-[#3498DB] hover:underline cursor-pointer"
                  >
                    Log In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegister(true)}
                    className="font-bold text-[#3498DB] hover:underline cursor-pointer"
                  >
                    Register here
                  </button>
                </>
              )}
            </div>

            {/* Quick Helper Note for reviewer */}
            <div className="mt-6 p-3 rounded-xl bg-[#F4FAFD] border border-[#E1EFF7] text-[11px] text-[#64748B] text-center">
              💡 <strong>Instant Review Access:</strong> Click either login button above to test with pre-filled credentials.
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
