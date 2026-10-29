import React, { useState, useEffect } from 'react';
import { ActivePage, UserRole } from '../types';
import { Button } from './Button';
import { Menu, X, GraduationCap, LayoutDashboard, BookOpen, Package, HelpCircle, Home } from 'lucide-react';

interface NavbarProps {
  currentPage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  userRole,
  onOpenLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToSection = (id: string) => {
    if (currentPage !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Home',             sectionId: '',                 isHome: true  },
    { label: 'Features',         sectionId: 'features-section'               },
    { label: 'Review Packages',  sectionId: 'packages-section'               },
    { label: 'About',            sectionId: 'about-section'                  },
    { label: 'Contact',          sectionId: 'contact-section'                },
  ];

  return (
    <>
      {/* ===== Desktop / Tablet Navbar ===== */}
      <header
        className={`rh-sticky-navbar sticky top-0 z-40 bg-white/97 backdrop-blur-md border-b border-[#E1EFF7] transition-shadow duration-200 ${
          scrolled ? 'shadow-md' : 'shadow-none'
        }`}
        role="banner"
        aria-label="ReviewHub site navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6 h-[4.5rem]">

          {/* Zone 1: Brand */}
          <button
            onClick={() => { onNavigate('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none rh-touch-btn shrink-0"
            aria-label="ReviewHub — go to homepage"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3498DB] to-[#5DADE2] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[1.2rem] font-extrabold tracking-tight text-[#2C3E50]">ReviewHub</span>
              <span className="text-[10px] font-semibold tracking-widest text-[#3498DB] uppercase mt-0.5">Meliora Learning Hub</span>
            </div>
          </button>

          {/* Zone 2: Desktop Nav Links */}
          <nav
            className="hidden md:flex items-center gap-7 text-sm font-medium text-[#2C3E50]"
            aria-label="Primary navigation"
          >
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => link.isHome
                  ? (onNavigate('landing'), window.scrollTo({ top: 0, behavior: 'smooth' }))
                  : scrollToSection(link.sectionId)
                }
                data-spy-target={link.sectionId || undefined}
                className={`rh-touch-btn hover:text-[#3498DB] transition-colors whitespace-nowrap shrink-0 cursor-pointer px-1 py-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3498DB] ${
                  currentPage === 'landing' && link.isHome ? 'text-[#3498DB] font-semibold' : ''
                }`}
                aria-current={currentPage === 'landing' && link.isHome ? 'page' : undefined}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Action Buttons (desktop) */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('student-enrollment')}
              className="text-[#3498DB] font-semibold border border-[#BCE0F7] hover:bg-[#D6ECFA]/40 rh-touch-btn"
            >
              Enroll Now
            </Button>
            {userRole === 'guest' ? (
              <>
                <button
                  onClick={onOpenLogin}
                  className="px-3 py-2 text-sm font-semibold text-[#2C3E50] hover:text-[#3498DB] transition-colors whitespace-nowrap cursor-pointer rh-touch-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3498DB] rounded"
                >
                  Log In
                </button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onNavigate('student-dashboard')}
                  className="rh-touch-btn"
                >
                  Student Portal
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<LayoutDashboard className="w-4 h-4 text-[#3498DB]" />}
                  onClick={() => onNavigate(userRole === 'admin' ? 'admin-dashboard' : 'student-dashboard')}
                  className="rh-touch-btn"
                >
                  {userRole === 'admin' ? 'Staff Portal' : 'Student Portal'}
                </Button>
                <button
                  onClick={onOpenLogin}
                  className="text-xs text-[#64748B] hover:text-[#2C3E50] px-2 py-1 transition-colors cursor-pointer rh-touch-btn rounded"
                >
                  Switch Account
                </button>
              </div>
            )}
          </div>

          {/* Zone 4: Mobile Controls */}
          <div className="md:hidden flex items-center gap-2 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={userRole === 'guest' ? onOpenLogin : () => onNavigate(userRole === 'admin' ? 'admin-dashboard' : 'student-dashboard')}
              className="rh-touch-btn"
            >
              {userRole === 'guest' ? 'Log In' : 'Portal'}
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-[#2C3E50] hover:bg-[#F4FAFD] rounded-xl cursor-pointer rh-touch-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3498DB]"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
            >
              {mobileMenuOpen
                ? <X className="w-6 h-6" aria-hidden="true" />
                : <Menu className="w-6 h-6" aria-hidden="true" />
              }
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <nav
            id="mobile-nav-drawer"
            className="md:hidden border-t border-[#E1EFF7] bg-white px-5 py-4 flex flex-col gap-1 shadow-lg"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => link.isHome
                  ? (onNavigate('landing'), window.scrollTo({ top: 0, behavior: 'smooth' }), setMobileMenuOpen(false))
                  : scrollToSection(link.sectionId)
                }
                className="text-left py-3 px-2 font-medium text-[#2C3E50] hover:text-[#3498DB] hover:bg-[#F4FAFD] rounded-xl transition-colors rh-touch-btn w-full"
              >
                {link.label}
              </button>
            ))}

            <div className="pt-3 mt-1 border-t border-[#F0F6FA] flex flex-col gap-2.5">
              <Button
                variant="primary"
                size="md"
                onClick={() => { onNavigate('student-dashboard'); setMobileMenuOpen(false); }}
                className="w-full justify-center rh-touch-btn"
              >
                Open Student Dashboard
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => { onNavigate('student-enrollment'); setMobileMenuOpen(false); }}
                className="w-full justify-center rh-touch-btn"
              >
                Enroll Now
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => { onNavigate('admin-dashboard'); setMobileMenuOpen(false); }}
                className="w-full justify-center text-[#64748B] rh-touch-btn"
              >
                Admin Staff Portal
              </Button>
            </div>
          </nav>
        )}
      </header>

      {/* ===== jQuery Mobile–inspired Bottom Nav Bar (mobile only) ===== */}
      {currentPage === 'landing' && (
        <nav
          className="rh-mobile-nav-bar"
          aria-label="Mobile bottom navigation"
          role="navigation"
        >
          <button
            className="rh-mobile-nav-item active rh-touch-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Home"
          >
            <Home aria-hidden="true" />
            <span>Home</span>
          </button>
          <button
            className="rh-mobile-nav-item rh-touch-btn"
            onClick={() => scrollToSection('features-section')}
            aria-label="Features"
          >
            <BookOpen aria-hidden="true" />
            <span>Features</span>
          </button>
          <button
            className="rh-mobile-nav-item rh-touch-btn"
            onClick={() => scrollToSection('packages-section')}
            aria-label="Packages"
          >
            <Package aria-hidden="true" />
            <span>Packages</span>
          </button>
          <button
            className="rh-mobile-nav-item rh-touch-btn"
            onClick={() => onNavigate('quiz')}
            aria-label="Quiz"
          >
            <HelpCircle aria-hidden="true" />
            <span>Quiz</span>
          </button>
          <button
            className="rh-mobile-nav-item rh-touch-btn"
            onClick={onOpenLogin}
            aria-label="Log In"
          >
            <LayoutDashboard aria-hidden="true" />
            <span>Log In</span>
          </button>
        </nav>
      )}
    </>
  );
};
