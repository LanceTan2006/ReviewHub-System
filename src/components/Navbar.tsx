import React, { useState, useEffect } from 'react';
import { ActivePage, UserRole } from '../types';
import { Button } from './Button';
import { Menu, X, LayoutDashboard, BookOpen, Package, HelpCircle, Home } from 'lucide-react';
import logoImg from '../assets/images/reviewhub_logo.png';

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToSection = (id: string) => {
    if (currentPage !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Home',            sectionId: '',                 isHome: true },
    { label: 'Features',        sectionId: 'features-section'              },
    { label: 'Packages',        sectionId: 'packages-section'              },
    { label: 'About',           sectionId: 'about-section'                 },
    { label: 'Contact',         sectionId: 'contact-section'               },
  ];

  return (
    <>
      {/* ===== Main Navbar ===== */}
      <header
        className={`rh-sticky-navbar sticky top-0 z-40 bg-white backdrop-blur-md border-b border-[#E1EFF7] transition-shadow duration-200 ${
          scrolled ? 'shadow-md' : ''
        }`}
        role="banner"
      >
        {/* Single row — logo | nav | actions */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-4">

          {/* ── Logo ── */}
          <button
            onClick={() => { onNavigate('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3498DB] rounded-lg"
            aria-label="ReviewHub — go to homepage"
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <img
              src={logoImg}
              alt="ReviewHub"
              style={{ height: '2.5rem', width: 'auto', display: 'block', objectFit: 'contain' }}
              onError={(e) => {
                // Fallback: show text brand if image fails
                const el = e.target as HTMLImageElement;
                el.style.display = 'none';
                const fallback = document.createElement('span');
                fallback.textContent = 'ReviewHub';
                fallback.style.cssText = 'font-size:1.25rem;font-weight:800;color:#2C3E50;';
                el.parentNode?.appendChild(fallback);
              }}
            />
          </button>

          {/* ── Desktop Nav Links (lg and up) ── */}
          <nav
            className="hidden lg:flex items-center gap-1 flex-1 justify-center"
            aria-label="Primary navigation"
          >
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() =>
                  link.isHome
                    ? (onNavigate('landing'), window.scrollTo({ top: 0, behavior: 'smooth' }))
                    : scrollToSection(link.sectionId)
                }
                data-spy-target={link.sectionId || undefined}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3498DB] hover:text-[#3498DB] hover:bg-[#F4FAFD] ${
                  currentPage === 'landing' && link.isHome
                    ? 'text-[#3498DB] font-semibold bg-[#EEF7FD]'
                    : 'text-[#2C3E50]'
                }`}
                aria-current={currentPage === 'landing' && link.isHome ? 'page' : undefined}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* ── Desktop Action Buttons (lg and up) ── */}
          <div className="hidden lg:flex items-center gap-2 shrink-0 ml-auto">
            {userRole === 'guest' ? (
              <>
                <button
                  onClick={onOpenLogin}
                  className="px-3 py-2 text-sm font-semibold text-[#2C3E50] hover:text-[#3498DB] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3498DB] rounded-lg"
                >
                  Log In
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('student-enrollment')}
                >
                  Enroll Now
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate('student-dashboard')}
                >
                  Student Portal
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('student-enrollment')}
                >
                  Enroll Now
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<LayoutDashboard className="w-4 h-4 text-[#3498DB]" />}
                  onClick={() => onNavigate(userRole === 'admin' ? 'admin-dashboard' : 'student-dashboard')}
                >
                  {userRole === 'admin' ? 'Staff Portal' : 'My Dashboard'}
                </Button>
                <button
                  onClick={onOpenLogin}
                  className="text-xs text-[#64748B] hover:text-[#2C3E50] px-2 py-1 transition-colors cursor-pointer rounded"
                >
                  Switch Account
                </button>
              </>
            )}
          </div>

          {/* ── Mobile/Tablet Controls (below lg) ── */}
          <div className="lg:hidden flex items-center gap-2 ml-auto shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={userRole === 'guest' ? onOpenLogin : () => onNavigate(userRole === 'admin' ? 'admin-dashboard' : 'student-dashboard')}
            >
              {userRole === 'guest' ? 'Log In' : 'Portal'}
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#2C3E50] hover:bg-[#F4FAFD] rounded-xl cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3498DB]"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-drawer"
            >
              {mobileMenuOpen
                ? <X className="w-5 h-5" />
                : <Menu className="w-5 h-5" />
              }
            </button>
          </div>
        </div>

        {/* ── Mobile Drawer ── */}
        {mobileMenuOpen && (
          <nav
            id="mobile-nav-drawer"
            className="lg:hidden border-t border-[#E1EFF7] bg-white"
            aria-label="Mobile navigation"
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() =>
                    link.isHome
                      ? (onNavigate('landing'), window.scrollTo({ top: 0, behavior: 'smooth' }), setMobileMenuOpen(false))
                      : scrollToSection(link.sectionId)
                  }
                  className="text-left w-full py-3 px-3 font-medium text-[#2C3E50] hover:text-[#3498DB] hover:bg-[#F4FAFD] rounded-xl transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div className="px-4 pb-4 pt-1 border-t border-[#F0F6FA] flex flex-col gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => { onNavigate('student-enrollment'); setMobileMenuOpen(false); }}
                className="w-full justify-center"
              >
                Enroll Now
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => { onNavigate('student-dashboard'); setMobileMenuOpen(false); }}
                className="w-full justify-center"
              >
                Student Dashboard
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => { onNavigate('admin-dashboard'); setMobileMenuOpen(false); }}
                className="w-full justify-center text-[#64748B]"
              >
                Admin Portal
              </Button>
            </div>
          </nav>
        )}
      </header>

      {/* ===== Mobile Bottom Nav Bar (landing page only) ===== */}
      {currentPage === 'landing' && (
        <nav
          className="rh-mobile-nav-bar"
          aria-label="Mobile bottom navigation"
        >
          <button
            className="rh-mobile-nav-item active"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Home"
          >
            <Home />
            <span>Home</span>
          </button>
          <button
            className="rh-mobile-nav-item"
            onClick={() => scrollToSection('features-section')}
            aria-label="Features"
          >
            <BookOpen />
            <span>Features</span>
          </button>
          <button
            className="rh-mobile-nav-item"
            onClick={() => scrollToSection('packages-section')}
            aria-label="Packages"
          >
            <Package />
            <span>Packages</span>
          </button>
          <button
            className="rh-mobile-nav-item"
            onClick={() => onNavigate('quiz')}
            aria-label="Quiz"
          >
            <HelpCircle />
            <span>Quiz</span>
          </button>
          <button
            className="rh-mobile-nav-item"
            onClick={onOpenLogin}
            aria-label="Log In"
          >
            <LayoutDashboard />
            <span>Log In</span>
          </button>
        </nav>
      )}
    </>
  );
};
