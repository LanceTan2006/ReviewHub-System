import React, { useState, useEffect } from 'react';
import { ActivePage, ReviewPackage } from '../types';
import { reviewPackages } from '../data/mockData';
import { Button } from '../components/Button';
import { Card, CardBody } from '../components/Card';
import { Modal } from '../components/Modal';
import logoImg from '../assets/images/reviewhub_logo.png';
import {
  Sparkles,
  CalendarCheck,
  HelpCircle,
  TrendingUp,
  FileCheck2,
  Check,
  ArrowRight,
  ShieldCheck,
  Clock,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Send,
  GraduationCap,
  Star,
  Users,
  Award,
  ChevronUp,
  Zap,
  Target,
  Brain,
  Globe,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: ActivePage) => void;
  onOpenLogin: () => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  packages?: ReviewPackage[];
}

// ----------------------------------------------------------------
// Reusable: Animated stat counter
// ----------------------------------------------------------------
const AnimatedCounter: React.FC<{
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
}> = ({ value, suffix = '', prefix = '', decimals = 0, label }) => {
  const [count, setCount] = useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started) { setStarted(true); obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    const duration = 1800;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * value).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, value, decimals]);

  return (
    <div ref={ref} className="text-center sm:text-left">
      <div
        className="rh-stat-number text-2xl sm:text-3xl text-[#2C3E50]"
        aria-label={`${prefix}${value}${suffix}`}
        data-counter=""
        data-target={value}
        data-suffix={suffix}
        data-prefix={prefix}
        data-decimals={decimals}
      >
        {prefix}{count.toFixed(decimals)}{suffix}
      </div>
      <div className="text-xs text-[#64748B] mt-1 leading-tight">{label}</div>
    </div>
  );
};

// ----------------------------------------------------------------
// Main LandingPage Component
// ----------------------------------------------------------------
export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenLogin,
  onShowToast,
  packages: propPackages,
}) => {
  const displayPackages = propPackages || reviewPackages;
  const [selectedPackage, setSelectedPackage] = useState<ReviewPackage | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '', email: '', phone: '', program: 'PRC Licensure Comprehensive', message: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  // ---- Validation ----
  const validateField = (name: string, value: string): string => {
    if (name === 'name' && !value.trim()) return 'Full name is required.';
    if (name === 'email') {
      if (!value.trim()) return 'Email address is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email.';
    }
    if (name === 'phone' && value.trim() && !/^[\d\s\+\-\(\)]{7,20}$/.test(value)) {
      return 'Please enter a valid phone number.';
    }
    return '';
  };

  const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const err = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Run all validations
    const newErrors: Record<string, string> = {};
    (['name', 'email', 'phone'] as const).forEach((f) => {
      const err = validateField(f, contactForm[f]);
      if (err) newErrors[f] = err;
    });
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }
    setIsSubmittingContact(true);
    setTimeout(() => {
      setIsSubmittingContact(false);
      onShowToast(
        'Inquiry Received!',
        'Thank you! A Meliora academic counselor will contact you within 24 hours.',
        'success'
      );
      setContactForm({ name: '', email: '', phone: '', program: 'PRC Licensure Comprehensive', message: '' });
      setFormErrors({});
    }, 700);
  };

  // ---- Data ----
  const features = [
    {
      title: 'AI Reviewer',
      description: 'Upload textbooks, PDFs, or lecture notes to get instant chapter summaries, formula sheets, and key concept digests powered by Gemini AI.',
      icon: <Sparkles className="w-6 h-6 text-[#3498DB]" aria-hidden="true" />,
      actionText: 'Try AI Reviewer',
      action: () => onNavigate('ai-reviewer'),
    },
    {
      title: 'Personalized Study Plan',
      description: 'Dynamic scheduling tailored for working students and full-time reviewees, prioritizing high-yield topics and diagnostic weak points.',
      icon: <CalendarCheck className="w-6 h-6 text-[#3498DB]" aria-hidden="true" />,
      actionText: 'View Dashboard',
      action: () => onNavigate('student-dashboard'),
    },
    {
      title: 'Practice Quiz',
      description: 'Unlimited subject-level questions with immediate answer rationale, difficulty scaling, and real exam time-pressure simulation.',
      icon: <HelpCircle className="w-6 h-6 text-[#3498DB]" aria-hidden="true" />,
      actionText: 'Take a Quiz',
      action: () => onNavigate('quiz'),
    },
    {
      title: 'Progress Analytics',
      description: 'Granular topic mastery indicators, percentile ranking, and historical score trends to measure real exam readiness at a glance.',
      icon: <TrendingUp className="w-6 h-6 text-[#3498DB]" aria-hidden="true" />,
      actionText: 'Explore Analytics',
      action: () => onNavigate('student-progress'),
    },
    {
      title: 'Full Mock Examination',
      description: 'Complete simulated licensure and entrance examinations calibrated to official test blueprints, time limits, and item distributions.',
      icon: <FileCheck2 className="w-6 h-6 text-[#3498DB]" aria-hidden="true" />,
      actionText: 'Run Simulation',
      action: () => onNavigate('quiz'),
    },
  ];

  const testimonials = [
    {
      name: 'Mark Lester Mendoza',
      badge: 'PRC Board Passer (Rank 4)',
      avatar: 'ML',
      color: '#3498DB',
      quote: 'As a working student with only 2 hours a night to review, ReviewHub\'s AI reviewer and bite-sized quizzes helped me laser-focus on high-yield formulas. Passed on my first take.',
    },
    {
      name: 'Catherine Mae Lim',
      badge: 'Civil Service Professional — 92.4%',
      avatar: 'CL',
      color: '#2980B9',
      quote: 'The diagnostic mock exams were virtually identical in format to the actual CSE. The detailed rationales turned tricky logic questions from intimidating to intuitive.',
    },
    {
      name: 'Patricia Nicole Cruz',
      badge: 'NLE Top 10 Nursing Board Passer',
      avatar: 'PC',
      color: '#5DADE2',
      quote: 'The AI reviewer summarized 900-page nursing textbooks into concise high-yield notes. My study time dropped by 40% while my mock scores improved dramatically.',
    },
    {
      name: 'Joshua David Bautista',
      badge: 'UPCAT Qualifier — UP Diliman',
      avatar: 'JB',
      color: '#1A6FAA',
      quote: 'I used ReviewHub during the last 3 months before UPCAT. The abstract reasoning drills and timed practice were exactly what I needed. Got into my dream course.',
    },
  ];

  const faqs = [
    {
      q: 'How does the AI Reviewer work?',
      a: 'You upload a PDF, textbook chapter, or paste your notes. The AI engine parses the content and generates structured summaries, formula flashcards, and key concept breakdowns. It then creates targeted quiz questions based on your material.',
    },
    {
      q: 'Can I access ReviewHub on my phone or tablet?',
      a: 'Yes. ReviewHub is fully mobile-responsive and works seamlessly on all modern smartphones and tablets. Touch-friendly controls, readable typography, and optimized layouts ensure a great experience on any screen size.',
    },
    {
      q: 'What is the difference between the review packages?',
      a: 'Each package targets a specific exam type (PRC Licensure, College Entrance, Civil Service, IELTS, or Working Student). They differ in modules, mock exam count, access duration, and specific study tools included. You can compare all packages on this page.',
    },
    {
      q: 'What payment methods are accepted?',
      a: 'We accept GCash, Maya, Credit/Debit Cards (Visa/Mastercard), and Bank Transfer (BPI, BDO, Metrobank). Payment confirmation and enrollment activation happen within 24 hours after verification.',
    },
    {
      q: 'Is there a free trial available?',
      a: 'Yes. You can access the AI Reviewer, one set of Practice Quiz questions, and a sample lesson for free without enrollment. Simply click "Student Portal" to explore the demo content.',
    },
  ];

  return (
    <main id="main-content" className="flex flex-col min-h-screen bg-[#F4FAFD] rh-page-with-mobile-nav">

      {/* ================================================================
          HERO SECTION
          ================================================================ */}
      <section
        className="relative overflow-hidden rh-gradient-hero rh-section-spacing"
        aria-labelledby="hero-heading"
      >
        {/* Ambient glow blobs */}
        <div className="rh-hero-gradient absolute top-0 right-1/4 w-[28rem] h-[28rem] bg-[#D6ECFA]/60" aria-hidden="true" />
        <div className="rh-hero-gradient absolute top-1/3 left-8 w-72 h-72 bg-[#5DADE2]/12" aria-hidden="true" />
        <div className="rh-hero-gradient absolute bottom-0 right-0 w-64 h-64 bg-[#BCE0F7]/40" aria-hidden="true" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

            {/* Left: Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badge */}
              <div className="rh-hero-badge w-fit" role="note">
                <ShieldCheck className="w-4 h-4 text-[#3498DB] shrink-0" aria-hidden="true" />
                <span>Meliora Learning Hub — Official Review Platform</span>
              </div>

              {/* Headline */}
              <h1
                id="hero-heading"
                className="rh-hero-title font-extrabold text-[#2C3E50] tracking-tight"
                style={{ textWrap: 'balance' } as React.CSSProperties}
              >
                Prepare Smarter.{' '}
                <br className="hidden sm:block" />
                Learn Better.{' '}
                <span className="text-[#3498DB]">Achieve More.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#64748B] max-w-xl leading-relaxed">
                An AI-powered review platform helping students organize materials, assess exam readiness,
                and prepare effectively — built for college reviewees, working professionals, and premier review centers across the Philippines.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1 rh-cta-buttons">
                <Button
                  variant="primary"
                  size="md"
                  icon={<ArrowRight className="w-4 h-4" aria-hidden="true" />}
                  iconPosition="right"
                  onClick={() => onNavigate('student-enrollment')}
                  aria-label="Enroll now in a review package"
                >
                  Enroll Now
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => onNavigate('student-dashboard')}
                >
                  Student Portal
                </Button>
                <button
                  onClick={() => document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#64748B] hover:text-[#3498DB] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3498DB] rounded px-1 py-2"
                  aria-label="Explore review packages"
                >
                  Explore Packages
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              {/* Trust Stats */}
              <div className="grid grid-cols-3 gap-4 pt-5 border-t border-[#E1EFF7]" aria-label="Key statistics">
                <AnimatedCounter value={94.8} suffix="%" decimals={1} label="National Passing Rate (2025–2026)" />
                <AnimatedCounter value={12400} suffix="+" label="Rationalized Practice Drills" />
                <AnimatedCounter value={15} suffix=" Mins" label="Daily AI Micro-Review" />
              </div>
            </div>

            {/* Right: Hero Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-white">
                <img
                  src="/src/assets/images/hero_students_tech_learning_1793090025301.jpg"
                  alt="Students studying with modern technology and AI learning assistant"
                  className="w-full h-auto object-cover"
                  referrerPolicy="no-referrer"
                  loading="eager"
                  width={600}
                  height={420}
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />

                {/* Floating overlay card */}
                <div className="p-4 bg-white/97 backdrop-blur-sm border-t border-[#E1EFF7] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#D6ECFA] flex items-center justify-center text-[#3498DB] shrink-0" aria-hidden="true">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#2C3E50]">AI Reviewer Active</div>
                      <div className="text-[11px] text-[#64748B]">Analyzed 48 Board Exam Past Papers</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#3498DB] bg-[#F4FAFD] px-2.5 py-1 rounded-lg border border-[#D6ECFA] shrink-0">
                    Ready
                  </span>
                </div>
              </div>

              {/* Social proof micro-badge */}
              <div className="absolute -bottom-4 -left-4 bg-white shadow-lg border border-[#E1EFF7] rounded-2xl px-4 py-2.5 flex items-center gap-2.5 hidden sm:flex">
                <div className="flex -space-x-2">
                  {['AL','JB','CM'].map((initials, i) => (
                    <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#3498DB] to-[#5DADE2] flex items-center justify-center text-white text-[10px] font-bold border-2 border-white" aria-hidden="true">
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2C3E50]">1,200+ Enrolled</div>
                  <div className="text-[10px] text-[#64748B]">This Semester</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          FEATURES SECTION
          ================================================================ */}
      <section
        id="features-section"
        className="rh-section-spacing bg-white border-y border-[#E1EFF7]"
        aria-labelledby="features-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center max-w-3xl mx-auto mb-12">
            <span className="rh-section-eyebrow" aria-hidden="true">System Capabilities</span>
            <h2 id="features-heading" className="text-[#2C3E50]">
              Designed For High-Yield Exam Preparation
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] mt-3 max-w-xl mx-auto">
              Everything students and review centers need to master challenging curricula with confidence.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 rh-stagger">
            {features.map((feat, idx) => (
              <article key={idx} className="rh-feature-card" aria-label={`Feature: ${feat.title}`}>
                <div className="rh-feature-icon" aria-hidden="true">
                  {feat.icon}
                </div>
                <h3 className="text-[1.05rem] font-bold text-[#2C3E50] mb-2">{feat.title}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed mb-5 flex-1">{feat.description}</p>
                <button
                  onClick={feat.action}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3498DB] hover:text-[#2980B9] transition-colors rh-touch-btn focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3498DB] rounded"
                  aria-label={`${feat.actionText} — ${feat.title}`}
                >
                  {feat.actionText}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </article>
            ))}

            {/* Target Audiences callout */}
            <div
              className="p-6 rounded-2xl bg-gradient-to-br from-[#3498DB] to-[#1A6FAA] text-white flex flex-col justify-between shadow-lg"
              role="region"
              aria-label="Target audiences"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/75 block mb-2">
                  Who It's For
                </span>
                <h3 className="text-xl font-bold mb-4">Tailored For Every Learning Style</h3>
                <ul className="text-sm space-y-2.5 text-white/90" role="list">
                  {[
                    { label: 'College Students', detail: 'Midterms, Finals & Entrance Exams' },
                    { label: 'Review Center Batches', detail: 'Diagnostic & Progress Tracking' },
                    { label: 'Working Students', detail: 'Night & weekend bite-sized study' },
                    { label: 'Administrators', detail: 'Roster, payment & schedule tools' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 shrink-0 text-white mt-0.5" aria-hidden="true" />
                      <span><strong>{item.label}:</strong> {item.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-5 mt-5 border-t border-white/20">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigate('admin-dashboard')}
                  className="w-full justify-center bg-white text-[#2980B9] font-bold border-0 hover:bg-[#F4FAFD] rh-touch-btn"
                  aria-label="View staff admin portal"
                >
                  View Staff Admin Portal
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          REVIEW PACKAGES SECTION
          ================================================================ */}
      <section
        id="packages-section"
        className="rh-section-spacing bg-[#F4FAFD]"
        aria-labelledby="packages-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center max-w-3xl mx-auto mb-12">
            <span className="rh-section-eyebrow" aria-hidden="true">Review Packages</span>
            <h2 id="packages-heading" className="text-[#2C3E50]">
              Invest in Your Licensure &amp; Exam Success
            </h2>
            <p className="text-sm sm:text-base text-[#64748B] mt-3 max-w-xl mx-auto">
              Transparent, all-inclusive programs with live mentors, AI study aids, and full diagnostic tests.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 rh-pkg-grid rh-stagger">
            {displayPackages.map((pkg) => (
              <article
                key={pkg.id}
                className={`rh-pkg-card ${pkg.popular ? 'rh-pkg-card--popular' : ''}`}
                aria-label={`Review package: ${pkg.title}`}
              >
                {pkg.popular && (
                  <div className="rh-pkg-badge" role="note" aria-label="Most popular package">
                    ⭐ Most Popular
                  </div>
                )}
                <div className="p-6 flex flex-col h-full" style={{ paddingTop: pkg.popular ? '1.75rem' : '1.5rem' }}>
                  <div>
                    <span className="text-[11px] font-bold text-[#3498DB] uppercase tracking-widest">
                      {pkg.category}
                    </span>
                    <h3 className="text-base font-bold text-[#2C3E50] mt-1.5 mb-2 leading-snug">
                      {pkg.title}
                    </h3>
                    <p className="text-xs text-[#64748B] mb-4 leading-relaxed">{pkg.targetAudience}</p>

                    <div className="py-3 border-y border-[#F0F6FA] mb-4">
                      <div className="flex items-baseline gap-1 flex-wrap">
                        <span className="text-2xl font-extrabold font-mono tabular-nums text-[#2C3E50]">
                          {pkg.price}
                        </span>
                        <span className="text-xs text-[#64748B]">/ {pkg.period}</span>
                      </div>
                      <div className="text-[11px] text-[#64748B] mt-1 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" aria-hidden="true" />
                        {pkg.totalModules} Modules · {pkg.mockExamsCount} Mock Exams
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6" role="list" aria-label="Package features">
                      {(pkg.features || []).map((feat: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#2C3E50]">
                          <Check className="w-3.5 h-3.5 text-[#3498DB] shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-2 mt-auto">
                    <Button
                      variant={pkg.popular ? 'primary' : 'secondary'}
                      size="md"
                      onClick={() => onNavigate('student-enrollment')}
                      className="w-full justify-center rh-touch-btn"
                      aria-label={`Enroll in ${pkg.title} — ${pkg.price}`}
                    >
                      Enroll in Package
                    </Button>
                    <button
                      onClick={() => setSelectedPackage(pkg)}
                      className="w-full text-center text-xs text-[#64748B] hover:text-[#3498DB] py-2 cursor-pointer font-medium rh-touch-btn rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3498DB]"
                      aria-label={`View syllabus details for ${pkg.title}`}
                    >
                      View Syllabus Details
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Quick comparison callout */}
          <div className="mt-10 p-5 rounded-2xl bg-white border border-[#E1EFF7] flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D6ECFA] flex items-center justify-center text-[#3498DB] shrink-0" aria-hidden="true">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#2C3E50]">Not sure which package suits you?</div>
                <div className="text-xs text-[#64748B] mt-0.5">Talk to an academic counselor — free, no commitment.</div>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="rh-touch-btn shrink-0"
            >
              Get Free Advice
            </Button>
          </div>
        </div>
      </section>

      {/* ================================================================
          ABOUT SECTION
          ================================================================ */}
      <section
        id="about-section"
        className="rh-section-spacing bg-white border-t border-[#E1EFF7]"
        aria-labelledby="about-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

            {/* Left: About content */}
            <div className="lg:col-span-6 space-y-6">
              <span className="rh-section-eyebrow">About Meliora Learning Hub</span>
              <h2 id="about-heading" className="text-[#2C3E50]">
                Dedicated to Academic Excellence &amp; Proven Exam Readiness
              </h2>
              <p className="text-sm sm:text-base text-[#64748B] leading-relaxed">
                Founded with the belief that comprehensive exam preparation should be accessible, structured,
                and scientifically grounded. ReviewHub bridges traditional lecture pedagogy with real-time AI
                summarization, adaptive diagnostics, and customized study tracks.
              </p>

              <dl className="space-y-4 pt-2">
                {[
                  {
                    icon: <GraduationCap className="w-4 h-4" aria-hidden="true" />,
                    title: 'Verified Licensure Mentors & Subject Matter Experts',
                    desc: 'All instructors hold active professional licenses and are curated for academic excellence.',
                  },
                  {
                    icon: <Brain className="w-4 h-4" aria-hidden="true" />,
                    title: 'Intelligent Rationale Engine',
                    desc: 'Every practice item comes with detailed explanation, difficulty rating, and subject classification.',
                  },
                  {
                    icon: <Globe className="w-4 h-4" aria-hidden="true" />,
                    title: 'Flexible 24/7 Cross-Device Access',
                    desc: 'Study on desktop, tablet, or phone — fully responsive and touch-optimized.',
                  },
                  {
                    icon: <Award className="w-4 h-4" aria-hidden="true" />,
                    title: 'Certificate of Completion',
                    desc: 'Earn a shareable digital certificate upon finishing each review package.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#D6ECFA] flex items-center justify-center text-[#3498DB] shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <dt className="text-sm font-semibold text-[#2C3E50]">{item.title}</dt>
                      <dd className="text-xs text-[#64748B] mt-0.5">{item.desc}</dd>
                    </div>
                  </div>
                ))}
              </dl>

              {/* Quick Stats strip */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                {[
                  { icon: <Users className="w-5 h-5" />, value: '8,500+', label: 'Active Students' },
                  { icon: <Star  className="w-5 h-5" />, value: '4.9 / 5', label: 'Avg. Rating' },
                  { icon: <Zap   className="w-5 h-5" />, value: '3 yrs',   label: 'Platform Experience' },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded-xl bg-[#F4FAFD] border border-[#E1EFF7] text-center">
                    <div className="flex justify-center text-[#3498DB] mb-1" aria-hidden="true">{s.icon}</div>
                    <div className="text-base font-extrabold font-mono text-[#2C3E50]">{s.value}</div>
                    <div className="text-[10px] text-[#64748B] mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Testimonials Carousel */}
            <div className="lg:col-span-6" aria-label="Student testimonials" aria-live="polite">
              <Card className="bg-[#FAFDFE] border-[#D6ECFA] overflow-hidden">
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-bold text-[#2C3E50]">Student Success Stories</h3>
                    <div className="flex items-center gap-1" role="group" aria-label="Testimonial navigation">
                      {testimonials.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveTestimonial(i)}
                          className={`w-2 h-2 rounded-full transition-all rh-touch-btn ${
                            i === activeTestimonial ? 'bg-[#3498DB] w-4' : 'bg-[#D6ECFA]'
                          }`}
                          aria-label={`Show testimonial ${i + 1}`}
                          aria-pressed={i === activeTestimonial}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Carousel slides */}
                  <div className="relative min-h-[9rem]">
                    {testimonials.map((t, i) => (
                      <div
                        key={i}
                        className={`rh-testimonial-slide transition-opacity duration-500 ${
                          i === activeTestimonial ? 'opacity-100' : 'opacity-0 absolute top-0 left-0 w-full pointer-events-none'
                        }`}
                        aria-hidden={i !== activeTestimonial}
                      >
                        <blockquote className="p-4 rounded-xl bg-white border border-[#E1EFF7]">
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                              style={{ background: `linear-gradient(135deg, ${t.color}, #5DADE2)` }}
                              aria-hidden="true"
                            >
                              {t.avatar}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#2C3E50]">{t.name}</div>
                              <div className="text-[11px] font-mono text-[#3498DB]">{t.badge}</div>
                            </div>
                            <div className="ml-auto flex text-yellow-400" aria-label="5 out of 5 stars" role="img">
                              {[...Array(5)].map((_, si) => <Star key={si} className="w-3 h-3 fill-current" aria-hidden="true" />)}
                            </div>
                          </div>
                          <p className="text-xs text-[#64748B] italic leading-relaxed">"{t.quote}"</p>
                        </blockquote>
                      </div>
                    ))}
                  </div>

                  {/* Profile image */}
                  <div className="mt-5 rounded-2xl overflow-hidden border border-[#E1EFF7]">
                    <img
                      src="/src/assets/images/avatar_student_meliora_1793090026459.jpg"
                      alt="Meliora Learning Hub student reviewing with ReviewHub platform"
                      className="w-full h-36 object-cover object-top"
                      loading="lazy"
                      width={400}
                      height={144}
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          FAQ SECTION
          ================================================================ */}
      <section
        id="faq-section"
        className="rh-section-spacing bg-[#F4FAFD] border-t border-[#E1EFF7]"
        aria-labelledby="faq-heading"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-10">
            <span className="rh-section-eyebrow" aria-hidden="true">FAQ</span>
            <h2 id="faq-heading" className="text-[#2C3E50]">Frequently Asked Questions</h2>
          </header>

          <dl className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-[#E1EFF7] overflow-hidden"
              >
                <dt>
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-sm font-semibold text-[#2C3E50] hover:bg-[#F4FAFD] transition-colors rh-touch-btn text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3498DB]"
                    aria-expanded={activeFaq === i}
                    aria-controls={`faq-answer-${i}`}
                  >
                    <span>{faq.q}</span>
                    <ChevronUp
                      className={`w-4 h-4 text-[#3498DB] shrink-0 transition-transform duration-200 ${
                        activeFaq === i ? 'rotate-0' : 'rotate-180'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </dt>
                <dd
                  id={`faq-answer-${i}`}
                  className={`overflow-hidden transition-all duration-300 ${
                    activeFaq === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                  aria-hidden={activeFaq !== i}
                >
                  <p className="px-5 pb-4 text-sm text-[#64748B] leading-relaxed">{faq.a}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ================================================================
          CONTACT SECTION
          ================================================================ */}
      <section
        id="contact-section"
        className="rh-section-spacing bg-white border-t border-[#E1EFF7]"
        aria-labelledby="contact-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Left: Contact info */}
            <div className="lg:col-span-5 space-y-6">
              <span className="rh-section-eyebrow">Get In Touch</span>
              <h2 id="contact-heading" className="text-[#2C3E50]">
                Have Questions? Speak With An Academic Counselor
              </h2>
              <p className="text-sm text-[#64748B] leading-relaxed">
                We're here to help you select the optimal review package and walk you through the full syllabus.
              </p>

              <address className="not-italic space-y-4 text-sm text-[#2C3E50]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#3498DB] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <div className="font-semibold">Meliora Learning Hub Headquarters</div>
                    <div className="text-xs text-[#64748B]">Unit 802 Academic Center, University Avenue, Manila, Philippines</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#3498DB] shrink-0" aria-hidden="true" />
                  <div>
                    <a href="tel:+63288729900" className="font-semibold hover:text-[#3498DB] transition-colors">
                      +63 (02) 8872-9900
                    </a>
                    {' / '}
                    <a href="tel:+639178002490" className="font-semibold hover:text-[#3498DB] transition-colors">
                      +63 917 800 2490
                    </a>
                    <div className="text-xs text-[#64748B]">Monday to Saturday, 8:00 AM – 7:00 PM PHT</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#3498DB] shrink-0" aria-hidden="true" />
                  <div>
                    <a href="mailto:admissions@meliorahub.edu.ph" className="font-semibold hover:text-[#3498DB] transition-colors">
                      admissions@meliorahub.edu.ph
                    </a>
                    <div className="text-xs text-[#64748B]">Response within 12 hours</div>
                  </div>
                </div>
              </address>

              {/* Quick links */}
              <div className="flex flex-wrap gap-2 pt-2">
                {['Facebook', 'LinkedIn', 'YouTube', 'TikTok'].map((platform) => (
                  <span
                    key={platform}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#3498DB] bg-[#D6ECFA]/60 border border-[#BCE0F7] cursor-pointer hover:bg-[#D6ECFA] transition-colors rh-touch-btn"
                    role="link"
                    tabIndex={0}
                    aria-label={`Visit our ${platform} page`}
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="lg:col-span-7">
              <Card className="bg-white border-[#E1EFF7]">
                <CardBody className="p-6 sm:p-8">
                  <form
                    id="rh-contact-form"
                    onSubmit={handleContactSubmit}
                    className="space-y-5"
                    noValidate
                    aria-label="Contact inquiry form"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Full Name */}
                      <div className="rh-form-group">
                        <label htmlFor="contact-name" className="rh-label">
                          Full Name <span className="rh-required" aria-label="required">*</span>
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          name="name"
                          required
                          autoComplete="name"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          onBlur={handleFieldBlur}
                          placeholder="e.g. Alyssa Reyes"
                          className={`rh-input ${formErrors.name ? 'rh-input-error' : ''}`}
                          aria-required="true"
                          aria-describedby={formErrors.name ? 'contact-name-error' : undefined}
                          aria-invalid={!!formErrors.name}
                          data-validate="required"
                        />
                        {formErrors.name && (
                          <span id="contact-name-error" className="rh-field-error" role="alert" style={{ display: 'block' }}>
                            {formErrors.name}
                          </span>
                        )}
                      </div>

                      {/* Email */}
                      <div className="rh-form-group">
                        <label htmlFor="contact-email" className="rh-label">
                          Email Address <span className="rh-required" aria-label="required">*</span>
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          name="email"
                          required
                          autoComplete="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          onBlur={handleFieldBlur}
                          placeholder="alyssa@email.com"
                          className={`rh-input ${formErrors.email ? 'rh-input-error' : ''}`}
                          aria-required="true"
                          aria-describedby={formErrors.email ? 'contact-email-error' : undefined}
                          aria-invalid={!!formErrors.email}
                          data-validate="email"
                        />
                        {formErrors.email && (
                          <span id="contact-email-error" className="rh-field-error" role="alert" style={{ display: 'block' }}>
                            {formErrors.email}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Phone */}
                      <div className="rh-form-group">
                        <label htmlFor="contact-phone" className="rh-label">Phone Number</label>
                        <input
                          id="contact-phone"
                          type="tel"
                          name="phone"
                          autoComplete="tel"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          onBlur={handleFieldBlur}
                          placeholder="+63 9XX XXX XXXX"
                          className={`rh-input ${formErrors.phone ? 'rh-input-error' : ''}`}
                          aria-describedby={formErrors.phone ? 'contact-phone-error' : undefined}
                          aria-invalid={!!formErrors.phone}
                          data-validate="tel"
                        />
                        {formErrors.phone && (
                          <span id="contact-phone-error" className="rh-field-error" role="alert" style={{ display: 'block' }}>
                            {formErrors.phone}
                          </span>
                        )}
                      </div>

                      {/* Program Select */}
                      <div className="rh-form-group">
                        <label htmlFor="contact-program" className="rh-label">Interested Program</label>
                        <select
                          id="contact-program"
                          name="program"
                          value={contactForm.program}
                          onChange={(e) => setContactForm({ ...contactForm, program: e.target.value })}
                          className="rh-input"
                          aria-label="Select a review program"
                        >
                          <option value="PRC Licensure Comprehensive">PRC Licensure Comprehensive</option>
                          <option value="College Entrance Exam (CET)">College Entrance Exam (CET)</option>
                          <option value="Civil Service Examination Pass">Civil Service Examination Pass</option>
                          <option value="Working Student Flexible Pass">Working Student Flexible Pass</option>
                          <option value="IELTS Masterclass">IELTS Academic &amp; General Masterclass</option>
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="rh-form-group">
                      <label htmlFor="contact-message" className="rh-label">Message or Questions</label>
                      <textarea
                        id="contact-message"
                        name="message"
                        rows={4}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder="Ask about batch schedules, payment terms, or diagnostic assessments..."
                        className="rh-input resize-none"
                        aria-label="Your message or questions"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={isSubmittingContact}
                      icon={<Send className="w-4 h-4" aria-hidden="true" />}
                      className="w-full justify-center rh-touch-btn"
                      aria-label={isSubmittingContact ? 'Sending your inquiry, please wait' : 'Submit your inquiry'}
                    >
                      {isSubmittingContact ? 'Sending Inquiry…' : 'Submit Inquiry'}
                    </Button>

                    <p className="text-[11px] text-[#94A3B8] text-center">
                      By submitting, you agree to our{' '}
                      <span className="underline cursor-pointer hover:text-[#3498DB]">Privacy Policy</span>.
                      We never share your data with third parties.
                    </p>
                  </form>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          FOOTER
          ================================================================ */}
      <footer className="bg-[#1E2D3D] text-white" role="contentinfo" aria-label="Site footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">

            {/* Brand */}
            <div className="space-y-4 sm:col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <img
                  src={logoImg}
                  alt="ReviewHub logo"
                  className="h-9 w-auto object-contain brightness-0 invert"
                />
              </div>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                Empowering future board passers, university entrants, and public servants with AI-driven learning tools.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Facebook', 'LinkedIn', 'YouTube'].map((p) => (
                  <span key={p} className="text-[11px] font-semibold text-[#5DADE2] hover:text-white cursor-pointer transition-colors rh-footer-link rh-touch-btn">{p}</span>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <nav aria-label="Footer quick links">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4">Quick Links</h3>
              <ul className="space-y-2.5" role="list">
                {[
                  { label: 'Home', action: () => { onNavigate('landing'); window.scrollTo({ top:0, behavior:'smooth' }); } },
                  { label: 'Student Dashboard', action: () => onNavigate('student-dashboard') },
                  { label: 'AI Reviewer', action: () => onNavigate('ai-reviewer') },
                  { label: 'Practice Quiz', action: () => onNavigate('quiz') },
                  { label: 'Progress Tracker', action: () => onNavigate('student-progress') },
                ].map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={link.action}
                      className="rh-footer-link text-[#94A3B8] text-xs hover:text-white rh-touch-btn"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Portals */}
            <nav aria-label="Footer portal links">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4">Portals</h3>
              <ul className="space-y-2.5" role="list">
                {[
                  { label: 'Student Sign In', action: onOpenLogin },
                  { label: 'Enroll Now', action: () => onNavigate('student-enrollment') },
                  { label: 'Review Center Admin', action: () => onNavigate('admin-dashboard') },
                  { label: 'Student Roster', action: () => onNavigate('admin-students') },
                  { label: 'Enrollment Mgmt.', action: () => onNavigate('admin-enrollment') },
                ].map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={link.action}
                      className="rh-footer-link text-[#94A3B8] text-xs hover:text-white rh-touch-btn"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Contact */}
            <address className="not-italic space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#94A3B8] mb-4">Contact</h3>
              <div className="flex items-start gap-2 text-xs text-[#94A3B8]">
                <MapPin className="w-3.5 h-3.5 text-[#5DADE2] shrink-0 mt-0.5" aria-hidden="true" />
                <span>Unit 802 Academic Center, University Ave., Manila, PH</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <Phone className="w-3.5 h-3.5 text-[#5DADE2] shrink-0" aria-hidden="true" />
                <a href="tel:+63288729900" className="hover:text-white transition-colors">+63 (02) 8872-9900</a>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                <Mail className="w-3.5 h-3.5 text-[#5DADE2] shrink-0" aria-hidden="true" />
                <a href="mailto:admissions@meliorahub.edu.ph" className="hover:text-white transition-colors">admissions@meliorahub.edu.ph</a>
              </div>
            </address>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#64748B] gap-4">
            <div>
              © {new Date().getFullYear()} Meliora Learning Hub. All rights reserved. ReviewHub System.
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-white cursor-pointer transition-colors">Licensure Guidelines</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ================================================================
          BACK TO TOP BUTTON (jQuery-enhanced via index.html)
          ================================================================ */}
      <button
        id="rh-back-to-top"
        aria-label="Back to top"
        title="Back to top"
        style={{ display: 'none' }}
      >
        <ChevronUp className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* ================================================================
          PACKAGE DETAILS MODAL
          ================================================================ */}
      {selectedPackage && (
        <Modal
          isOpen={!!selectedPackage}
          onClose={() => setSelectedPackage(null)}
          title={selectedPackage.title}
          subtitle={`Category: ${selectedPackage.category} · ${selectedPackage.period}`}
          maxWidth="lg"
          footer={
            <>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setSelectedPackage(null)}
                className="rh-touch-btn"
                data-modal-close=""
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setSelectedPackage(null);
                  onShowToast('Redirecting to Enrollment', `Selected: ${selectedPackage.title}`, 'info');
                  onNavigate('student-enrollment');
                }}
                className="rh-touch-btn"
              >
                Enroll Now ({selectedPackage.price})
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-[#64748B] leading-relaxed">{selectedPackage.description}</p>
            <div className="p-3.5 bg-[#F4FAFD] rounded-xl border border-[#D6ECFA]">
              <div className="text-xs font-bold text-[#2C3E50] mb-1">Target Audience</div>
              <div className="text-xs text-[#64748B]">{selectedPackage.targetAudience}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-[#E1EFF7] text-center">
                <div className="text-lg font-extrabold font-mono text-[#2C3E50]">{selectedPackage.totalModules}</div>
                <div className="text-[11px] text-[#64748B]">Total Modules</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-[#E1EFF7] text-center">
                <div className="text-lg font-extrabold font-mono text-[#2C3E50]">{selectedPackage.mockExamsCount}</div>
                <div className="text-[11px] text-[#64748B]">Full Mock Exams</div>
              </div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#2C3E50] mb-3">
                Included Features &amp; Syllabus Modules
              </div>
              <ul className="space-y-2.5 text-xs text-[#2C3E50]" role="list">
                {selectedPackage.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#3498DB] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
};
