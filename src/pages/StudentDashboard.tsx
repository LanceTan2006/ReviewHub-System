import React, { useState } from 'react';
import { ActivePage } from '../types';
import { sampleLessons } from '../data/mockData';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import {
  Package,
  TrendingUp,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  Play,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Layers,
  Flame,
  ChevronRight
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (page: ActivePage) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'completed'>('all');

  const filteredLessons = sampleLessons.filter((lesson) => {
    if (activeTab === 'in-progress') return !lesson.completed && lesson.progressPercent > 0;
    if (activeTab === 'completed') return lesson.completed;
    return true;
  });

  const subjectProgress = [
    { subject: 'Applied Mathematics & Statistics', mastery: 84, status: 'Strong Mastery' },
    { subject: 'Thermodynamics & Energy Transfer', mastery: 68, status: 'Needs Review' },
    { subject: 'Fluid Mechanics & Transport', mastery: 72, status: 'On Track' },
    { subject: 'Constitutional Law & Legal Ethics', mastery: 95, status: 'Excellent' },
    { subject: 'Organic Chemistry & Reaction Synthesis', mastery: 62, status: 'AI Focus Alert' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E1EFF7] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#3498DB] mb-1">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>14-Day Study Streak Active · Meliora Student Space</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C3E50] tracking-tight">
            Welcome back, Student! 👋
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Your personalized study pathway is 74% complete. Keep momentum toward your target exam!
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="md"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={() => onNavigate('ai-reviewer')}
          >
            AI Reviewer Assistant
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<Play className="w-4 h-4" />}
            onClick={() => onNavigate('quiz')}
          >
            Take Daily Drill
          </Button>
        </div>
      </div>

      {/* Dashboard KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Current Package */}
        <Card className="border-[#E1EFF7] hover:border-[#5DADE2] transition-colors">
          <CardBody className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-xs font-semibold">Current Package</span>
              <Package className="w-4 h-4 text-[#3498DB]" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#2C3E50] leading-tight line-clamp-1">
                PRC Licensure Mastery
              </div>
              <div className="text-[11px] text-[#3498DB] font-semibold mt-0.5">
                Batch Alpha · 2026
              </div>
            </div>
            <button
              onClick={() => onNavigate('student-packages')}
              className="text-[11px] text-[#64748B] hover:text-[#3498DB] font-medium mt-3 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Package syllabus</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </CardBody>
        </Card>

        {/* Card 2: Learning Progress */}
        <Card className="border-[#E1EFF7] hover:border-[#5DADE2] transition-colors">
          <CardBody className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-xs font-semibold">Learning Progress</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-[#2C3E50]">
                74%
              </div>
              <ProgressBar value={74} showPercent={false} size="sm" className="mt-2" />
            </div>
            <div className="text-[11px] text-[#64748B] mt-3">
              +6% gained this past week
            </div>
          </CardBody>
        </Card>

        {/* Card 3: Quiz Average Score */}
        <Card className="border-[#E1EFF7] hover:border-[#5DADE2] transition-colors">
          <CardBody className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-xs font-semibold">Quiz Average Score</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-[#2C3E50]">
                89.2%
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                Top 8% Cohort Percentile
              </div>
            </div>
            <button
              onClick={() => onNavigate('quiz')}
              className="text-[11px] text-[#64748B] hover:text-[#3498DB] font-medium mt-3 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View score logs</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </CardBody>
        </Card>

        {/* Card 4: Completed Lessons */}
        <Card className="border-[#E1EFF7] hover:border-[#5DADE2] transition-colors">
          <CardBody className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-xs font-semibold">Completed Lessons</span>
              <BookOpen className="w-4 h-4 text-[#3498DB]" />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-[#2C3E50]">
                48 <span className="text-xs font-normal text-[#64748B]">/ 65</span>
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">
                17 remaining in curriculum
              </div>
            </div>
            <button
              onClick={() => onNavigate('student-lessons')}
              className="text-[11px] text-[#64748B] hover:text-[#3498DB] font-medium mt-3 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Browse modules</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </CardBody>
        </Card>

        {/* Card 5: Upcoming Examination */}
        <Card className="border-[#E1EFF7] hover:border-[#5DADE2] transition-colors bg-gradient-to-b from-white to-[#F4FAFD]">
          <CardBody className="p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-[#64748B] mb-2">
              <span className="text-xs font-semibold">Upcoming Examination</span>
              <Calendar className="w-4 h-4 text-[#3498DB]" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#2C3E50] leading-snug">
                Simulated Board Exam 4
              </div>
              <div className="text-xs font-mono font-semibold text-rose-600 mt-1">
                Nov 30, 2026 (34 days)
              </div>
            </div>
            <button
              onClick={() => onNavigate('quiz')}
              className="text-[11px] text-[#3498DB] font-semibold mt-3 inline-flex items-center gap-1 cursor-pointer hover:underline"
            >
              <span>Register countdown</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </CardBody>
        </Card>
      </div>

      {/* Main Grid: Left (Recent Lessons & Progress Chart) + Right (AI Suggestions & Recommended Topics) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section: Recent Lessons */}
          <Card>
            <CardHeader
              title="Recent Lessons"
              subtitle="Continue where you left off or jump into next sequential lesson"
              action={
                <div className="flex items-center gap-1 p-1 bg-[#F4FAFD] border border-[#E1EFF7] rounded-lg">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      activeTab === 'all'
                        ? 'bg-white text-[#2C3E50] shadow-xs'
                        : 'text-[#64748B] hover:text-[#2C3E50]'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab('in-progress')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      activeTab === 'in-progress'
                        ? 'bg-white text-[#2C3E50] shadow-xs'
                        : 'text-[#64748B] hover:text-[#2C3E50]'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => setActiveTab('completed')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      activeTab === 'completed'
                        ? 'bg-white text-[#2C3E50] shadow-xs'
                        : 'text-[#64748B] hover:text-[#2C3E50]'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              }
            />
            <CardBody className="p-0 divide-y divide-[#F0F6FA]">
              {filteredLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-5 hover:bg-[#FAFDFE] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <span className="font-medium text-[#3498DB]">{lesson.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.duration}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{lesson.materialsCount} Reviewer Files</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#2C3E50] truncate">{lesson.title}</h4>
                    <p className="text-xs text-[#64748B]">Instructor: {lesson.instructor}</p>

                    <div className="max-w-xs pt-1">
                      <ProgressBar
                        value={lesson.progressPercent}
                        showPercent={true}
                        size="sm"
                        color={lesson.completed ? 'bg-emerald-500' : 'bg-[#3498DB]'}
                      />
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {lesson.completed ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        onClick={() => {
                          onShowToast('Reviewing Module', `Reopening ${lesson.title}`, 'info');
                          onNavigate('student-lessons');
                        }}
                      >
                        Review
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Play className="w-3.5 h-3.5" />}
                        onClick={() => {
                          onShowToast('Module Resumed', `Playing ${lesson.title}`, 'success');
                          onNavigate('student-lessons');
                        }}
                      >
                        {lesson.progressPercent > 0 ? 'Resume' : 'Start'}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Section: Progress Chart / Subject Mastery Breakdown */}
          <Card>
            <CardHeader
              title="Progress Chart & Subject Mastery"
              subtitle="Diagnostic breakdown across major examination competency domains"
            />
            <CardBody className="space-y-4">
              {subjectProgress.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#2C3E50]">{item.subject}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-medium ${
                          item.mastery >= 80
                            ? 'text-emerald-600'
                            : item.mastery >= 70
                            ? 'text-[#3498DB]'
                            : 'text-amber-600'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="font-mono tabular-nums font-bold text-[#2C3E50]">
                        {item.mastery}%
                      </span>
                    </div>
                  </div>
                  <ProgressBar
                    value={item.mastery}
                    showPercent={false}
                    size="md"
                    color={
                      item.mastery >= 80
                        ? 'bg-emerald-500'
                        : item.mastery >= 70
                        ? 'bg-[#3498DB]'
                        : 'bg-amber-500'
                    }
                  />
                </div>
              ))}

              <div className="p-3.5 bg-[#FAFDFE] rounded-xl border border-[#D6ECFA] flex items-center justify-between text-xs mt-4">
                <span className="text-[#64748B]">Overall Licensure Preparedness Index</span>
                <span className="font-bold text-[#2C3E50] font-mono tabular-nums">
                  Pass Probability: 91.4%
                </span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column (5 cols): Recommended Topics & AI Study Suggestions */}
        <div className="lg:col-span-5 space-y-8">
          {/* Section: AI Study Suggestions */}
          <Card className="border-[#BCE0F7] bg-gradient-to-b from-[#F4FAFD] to-white">
            <CardHeader
              title="AI Study Suggestions"
              subtitle="Targeted prompts based on your latest diagnostic test responses"
              action={
                <div className="w-7 h-7 rounded-lg bg-[#D6ECFA] flex items-center justify-center text-[#3498DB]">
                  <Sparkles className="w-4 h-4" />
                </div>
              }
            />
            <CardBody className="p-5 space-y-3">
              <div className="p-4 rounded-xl bg-white border border-[#D6ECFA] shadow-2xs hover:border-[#3498DB] transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-bold text-[#2C3E50]">
                    Weakness Alert: Organic Synthesis Reactions
                  </div>
                  <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    Priority
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-1 mb-3">
                  You missed 2 questions on aldehyde and ester reduction. Practice a 5-minute flashcard session.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('ai-reviewer')}
                  className="w-full justify-center"
                >
                  Generate Synthesis Flashcards
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#D6ECFA] shadow-2xs hover:border-[#3498DB] transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-bold text-[#2C3E50]">
                    Speed Calibration: Fluid Dynamics
                  </div>
                  <span className="text-[10px] font-mono text-[#3498DB] bg-[#F4FAFD] px-2 py-0.5 rounded-md border border-[#D6ECFA]">
                    Pacing
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-1 mb-3">
                  Average time per Reynolds problem was 2.4 minutes. Target under 1.5 minutes for exam readiness.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('quiz')}
                  className="w-full justify-center"
                >
                  Launch 5-Question Speed Drill
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#D6ECFA] shadow-2xs hover:border-[#3498DB] transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-xs font-bold text-[#2C3E50]">
                    Reviewer File Ready for Digest
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    New Note
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-1 mb-3">
                  "Module_4_Cellular_Biology_Notes.pdf" is uploaded. Generate bullet summary & quiz.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate('ai-reviewer')}
                  className="w-full justify-center"
                >
                  Open AI Reviewer Engine
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Section: Recommended Topics */}
          <Card>
            <CardHeader
              title="Recommended Topics"
              subtitle="Curated by Meliora faculty for upcoming November licensure"
            />
            <CardBody className="p-0 divide-y divide-[#F0F6FA]">
              <div className="p-4 hover:bg-[#FAFDFE] transition-colors flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-[#2C3E50]">
                    Carnot Cycle & Entropy Variations
                  </h5>
                  <p className="text-[11px] text-[#64748B]">Thermodynamics · 8 Board Past Exam Items</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onShowToast('Opening Topic Drill', 'Loading Carnot Cycle items', 'info');
                    onNavigate('quiz');
                  }}
                  className="text-[#3498DB] hover:text-[#2980B9]"
                >
                  Practice
                </Button>
              </div>

              <div className="p-4 hover:bg-[#FAFDFE] transition-colors flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-[#2C3E50]">
                    Bill of Rights & Due Process Exceptions
                  </h5>
                  <p className="text-[11px] text-[#64748B]">Law & Ethics · High-Yield Board Topic</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onShowToast('Opening Topic Drill', 'Loading Constitutional Law drill', 'info');
                    onNavigate('quiz');
                  }}
                  className="text-[#3498DB] hover:text-[#2980B9]"
                >
                  Practice
                </Button>
              </div>

              <div className="p-4 hover:bg-[#FAFDFE] transition-colors flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-[#2C3E50]">
                    Pipe Head Loss & Darcy-Weisbach Equation
                  </h5>
                  <p className="text-[11px] text-[#64748B]">Applied Fluid Flow · Calculation Heavy</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onShowToast('Opening Topic Drill', 'Loading Darcy-Weisbach drill', 'info');
                    onNavigate('quiz');
                  }}
                  className="text-[#3498DB] hover:text-[#2980B9]"
                >
                  Practice
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
