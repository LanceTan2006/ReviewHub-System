import React, { useState, useEffect } from 'react';
import { ActivePage, QuizQuestion } from '../types';
import { sampleQuizQuestions, sampleIeltsQuestions, getIeltsBandScore } from '../data/mockData';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { Modal } from '../components/Modal';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BookOpen,
  Flag,
  Award,
  Globe,
  Sliders
} from 'lucide-react';

interface QuizPageProps {
  onNavigate: (page: ActivePage) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
  /**
   * 'practice' — short drill, 5 questions, 15 min, no IELTS toggle shown,
   *              labeled "Practice Quiz"
   * 'mock'     — full simulation, all questions, 60 min, labeled
   *              "Mock Examination" with exam-room styling
   * Defaults to 'practice' for backward compatibility.
   */
  mode?: 'practice' | 'mock';
}

export const QuizPage: React.FC<QuizPageProps> = ({
  onNavigate,
  onShowToast,
  mode = 'practice',
}) => {
  const isMock = mode === 'mock';

  // Test Mode: 'general' (PRC percentage) vs 'ielts' (Band Score 1.0 - 9.0)
  // IELTS toggle only available in practice mode
  const [testMode, setTestMode] = useState<'general' | 'ielts'>('general');

  const allQuestions = testMode === 'ielts' ? sampleIeltsQuestions : sampleQuizQuestions;
  // Practice = 5 questions; Mock = all questions (simulate full exam)
  const questions = isMock ? allQuestions : allQuestions.slice(0, 5);

  // Timer: practice = 15 min, mock = 60 min
  const TIMER_DURATION = isMock ? 60 * 60 : 15 * 60;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(TIMER_DURATION);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false); // ← starts paused
  const [hasStarted, setHasStarted] = useState<boolean>(false);         // ← new: shows start screen
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // Timer tick
  useEffect(() => {
    if (!isTimerRunning || isSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, isSubmitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questions[currentIdx].id]: optionIndex,
    }));
  };

  const toggleFlag = (qId: number) => {
    setFlaggedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleSubmitQuiz = () => {
    setIsConfirmModalOpen(false);
    setIsSubmitted(true);
    setIsTimerRunning(false);
    onShowToast('Exam Submitted!', 'Your performance has been graded with full rationales.', 'success');
  };

  const handleRetake = () => {
    setUserAnswers({});
    setFlaggedQuestions({});
    setCurrentIdx(0);
    setTimeLeft(TIMER_DURATION);
    setIsTimerRunning(false);
    setHasStarted(false);
    setIsSubmitted(false);
  };

  // Calculate score
  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = questions.filter(
    (q) => userAnswers[q.id] === q.correctIndex
  ).length;
  const scorePercent = Math.round((correctCount / questions.length) * 100);
  const ieltsBand = getIeltsBandScore(correctCount, questions.length);

  // Missed topics for recommendations
  const missedQuestions = questions.filter(
    (q) => userAnswers[q.id] !== q.correctIndex
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">

      {/* ══════════════════════════════════════════════════════
          START SCREEN — shown before the exam begins
          ══════════════════════════════════════════════════════ */}
      {!hasStarted && !isSubmitted && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-0">
          <div className={`w-full max-w-2xl rounded-3xl border-2 overflow-hidden shadow-lg ${
            isMock ? 'border-[#2C3E50]' : 'border-[#3498DB]'
          }`}>

            {/* Colour band header */}
            <div className={`p-8 text-white text-center ${
              isMock
                ? 'bg-gradient-to-br from-[#2C3E50] to-[#1A252F]'
                : 'bg-gradient-to-br from-[#3498DB] to-[#2980B9]'
            }`}>
              <div className={`w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center ${
                isMock ? 'bg-white/10' : 'bg-white/20'
              }`}>
                {isMock
                  ? <i className="bi bi-file-earmark-ruled text-5xl" aria-hidden="true" />
                  : <i className="bi bi-question-circle text-5xl" aria-hidden="true" />
                }
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                {isMock ? 'Mock Examination' : 'Practice Quiz'}
              </h1>
              <p className="text-sm text-white/80 mt-2">
                {isMock
                  ? 'Full-length simulation under official exam conditions'
                  : 'Subject drill with immediate feedback and rationales'}
              </p>
            </div>

            {/* Exam details grid */}
            <div className="bg-white p-7 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: 'bi-list-ol',          label: 'Questions',   value: `${questions.length} items` },
                  { icon: 'bi-clock',             label: 'Time Limit',  value: isMock ? '60 minutes' : '15 minutes' },
                  { icon: 'bi-bar-chart-fill',    label: 'Scoring',     value: testMode === 'ielts' ? 'IELTS Band' : isMock ? 'PRC Format' : 'Percentage' },
                  { icon: 'bi-shield-check',      label: 'Difficulty',  value: isMock ? 'Board-Level' : 'Mixed' },
                ].map((d) => (
                  <div key={d.label} className="p-3.5 rounded-xl bg-[#F4FAFD] border border-[#E1EFF7] text-center">
                    <i className={`${d.icon} text-[#3498DB] text-xl block mb-1`} aria-hidden="true" />
                    <div className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">{d.label}</div>
                    <div className="text-sm font-extrabold text-[#2C3E50] mt-0.5">{d.value}</div>
                  </div>
                ))}
              </div>

              {/* Mode selector — practice only */}
              {!isMock && (
                <div>
                  <p className="text-xs font-bold text-[#2C3E50] mb-2">Select Quiz Type</p>
                  <div className="flex items-center gap-2 p-1 bg-[#F4FAFD] border border-[#D6ECFA] rounded-xl w-fit">
                    <button
                      type="button"
                      onClick={() => setTestMode('general')}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        testMode === 'general' ? 'bg-white text-[#2980B9] shadow-xs' : 'text-[#64748B] hover:text-[#2C3E50]'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" /> PRC / General Board
                    </button>
                    <button
                      type="button"
                      onClick={() => setTestMode('ielts')}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        testMode === 'ielts' ? 'bg-white text-[#2980B9] shadow-xs' : 'text-[#64748B] hover:text-[#2C3E50]'
                      }`}
                    >
                      <Globe className="w-3.5 h-3.5" /> IELTS Band Scoring
                    </button>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                isMock ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-[#F4FAFD] border-[#D6ECFA] text-[#64748B]'
              }`}>
                <p className="font-bold flex items-center gap-1.5">
                  <i className={`${isMock ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill'} text-sm`} aria-hidden="true" />
                  {isMock ? 'Exam Conditions' : 'Instructions'}
                </p>
                {isMock ? (
                  <ul className="space-y-1 pl-1 list-none">
                    <li>• The timer begins only after you click <strong>Start Exam</strong>.</li>
                    <li>• Unanswered items are marked incorrect upon submission or timeout.</li>
                    <li>• Full rationale review is shown after submission.</li>
                    <li>• Ensure stable internet before starting.</li>
                  </ul>
                ) : (
                  <ul className="space-y-1 pl-1 list-none">
                    <li>• The timer begins only when you press <strong>Start Practice Quiz</strong>.</li>
                    <li>• Answer all {questions.length} questions within {15} minutes.</li>
                    <li>• Flag questions to revisit before submitting.</li>
                    <li>• Correct answers and explanations appear after submission.</li>
                  </ul>
                )}
              </div>

              {/* Start button */}
              <button
                onClick={() => { setHasStarted(true); setIsTimerRunning(true); }}
                className={`w-full py-4 rounded-2xl text-white text-base font-extrabold tracking-wide flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98] ${
                  isMock
                    ? 'bg-gradient-to-r from-[#2C3E50] to-[#34495E] hover:from-[#1A252F] hover:to-[#2C3E50]'
                    : 'bg-gradient-to-r from-[#3498DB] to-[#2980B9] hover:from-[#2980B9] hover:to-[#1F6FAB]'
                }`}
                aria-label={isMock ? 'Start mock examination' : 'Start practice quiz'}
              >
                <i className="bi bi-play-fill text-2xl" aria-hidden="true" />
                {isMock ? 'Start Exam' : 'Start Practice Quiz'}
              </button>

              <p className="text-center text-[11px] text-[#94A3B8]">
                {isMock
                  ? 'The 60-minute countdown starts only after you begin the exam.'
                  : 'The 15-minute timer starts only after you begin the quiz.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          ACTIVE EXAM / RESULTS — only shown after start
          ══════════════════════════════════════════════════════ */}
      {hasStarted && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E1EFF7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#3498DB] mb-1">
                <Award className="w-4 h-4" />
                <span>
                  {isMock
                    ? 'Full Simulation · Official Exam Format · Meliora Review Standard'
                    : 'Subject Drill · Immediate Rationale Feedback'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#2C3E50]">
                {isMock
                  ? 'Mock Examination — Full Diagnostic Simulation'
                  : 'Practice Quiz — Subject Drill'}
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                {isMock
                  ? `${questions.length} Questions · ${testMode === 'ielts' ? 'IELTS Band Scoring' : 'PRC Licensure Format'} · 60-Minute Timed Exam`
                  : `${questions.length} Questions · ${testMode === 'ielts' ? 'IELTS Band Scoring' : 'Board Exam Standard'} · 15-Minute Quick Drill`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              {!isMock && !isSubmitted && (
                <div className="flex items-center gap-1 p-1 bg-[#F4FAFD] border border-[#D6ECFA] rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => { setTestMode('general'); setCurrentIdx(0); setUserAnswers({}); }}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      testMode === 'general' ? 'bg-white text-[#2980B9] shadow-xs' : 'text-[#64748B] hover:text-[#2C3E50]'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />PRC / General
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTestMode('ielts'); setCurrentIdx(0); setUserAnswers({}); }}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      testMode === 'ielts' ? 'bg-white text-[#2980B9] shadow-xs' : 'text-[#64748B] hover:text-[#2C3E50]'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />IELTS Band
                  </button>
                </div>
              )}

              {isMock && !isSubmitted && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
                  <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
                  Official Exam Conditions Apply
                </div>
              )}

              <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border ${
                isMock
                  ? 'bg-[#2C3E50] border-[#2C3E50] text-white'
                  : 'bg-[#F4FAFD] border-[#D6ECFA]'
              }`}>
                <Clock className={`w-4 h-4 ${
                  timeLeft < 180 ? 'text-rose-400 animate-pulse' : isMock ? 'text-[#5DADE2]' : 'text-[#3498DB]'
                }`} />
                <span className={`font-mono text-base font-bold tabular-nums ${isMock ? 'text-white' : 'text-[#2C3E50]'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>

              {!isSubmitted && (
                <Button variant="primary" size="md" onClick={() => setIsConfirmModalOpen(true)}>
                  {isMock ? 'Submit Exam' : 'Submit Quiz'}
                </Button>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E1EFF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 max-w-sm">
              <ProgressBar
                value={(answeredCount / questions.length) * 100}
                label={`Answered ${answeredCount} of ${questions.length} questions`}
                size="sm"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {questions.map((q, idx) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isCurrent = currentIdx === idx;
                const isFlagged = flaggedQuestions[q.id];

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center cursor-pointer shrink-0 relative ${
                      isCurrent
                        ? 'bg-[#3498DB] text-white ring-2 ring-[#3498DB]/30'
                        : isAnswered
                        ? 'bg-[#D6ECFA] text-[#2980B9]'
                        : 'bg-[#F4FAFD] text-[#64748B] border border-[#E1EFF7]'
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {!isSubmitted ? (
            <div className="space-y-6">
              <Card className="border-[#D6ECFA]">
                <CardHeader
                  title={`Question ${currentIdx + 1} of ${questions.length}`}
                  subtitle={`Subject: ${questions[currentIdx].subject} · Difficulty: ${questions[currentIdx].difficulty}`}
                  action={
                    <button
                      onClick={() => toggleFlag(questions[currentIdx].id)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                        flaggedQuestions[questions[currentIdx].id]
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-white text-[#64748B] border-[#E1EFF7] hover:text-[#2C3E50]'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      <span>
                        {flaggedQuestions[questions[currentIdx].id] ? 'Flagged for Review' : 'Flag Question'}
                      </span>
                    </button>
                  }
                />

                <CardBody className="p-6 space-y-6">
                  <p className="text-base sm:text-lg font-semibold text-[#2C3E50] leading-relaxed">
                    {questions[currentIdx].question}
                  </p>

                  <div className="space-y-3">
                    {questions[currentIdx].options.map((option, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isSelected = userAnswers[questions[currentIdx].id] === optIdx;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleSelectOption(optIdx)}
                          className={`w-full p-4 rounded-xl border text-left text-sm transition-all flex items-start gap-3.5 cursor-pointer ${
                            isSelected
                              ? 'border-[#3498DB] bg-[#D6ECFA]/40 text-[#2C3E50] shadow-xs'
                              : 'border-[#E1EFF7] bg-white text-[#2C3E50] hover:bg-[#FAFDFE] hover:border-[#BCE0F7]'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              isSelected
                                ? 'bg-[#3498DB] text-white'
                                : 'bg-[#F4FAFD] text-[#64748B] border border-[#E1EFF7]'
                            }`}
                          >
                            {letter}
                          </span>
                          <span className="flex-1 leading-relaxed">{option}</span>
                        </button>
                      );
                    })}
                  </div>
                </CardBody>
              </Card>

              <div className="flex items-center justify-between">
                <Button
                  variant="secondary"
                  size="md"
                  icon={<ArrowLeft className="w-4 h-4" />}
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                >
                  Previous Question
                </Button>

                {currentIdx < questions.length - 1 ? (
                  <Button
                    variant="primary"
                    size="md"
                    icon={<ArrowRight className="w-4 h-4" />}
                    iconPosition="right"
                    onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                  >
                    Next Question
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsConfirmModalOpen(true)}
                  >
                    Submit Examination
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-300">
              <Card className="border-[#BCE0F7] bg-gradient-to-b from-white to-[#F4FAFD] text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-[#D6ECFA] flex items-center justify-center text-[#3498DB] mx-auto mb-4">
                  {testMode === 'ielts' ? <Globe className="w-8 h-8" /> : <Award className="w-8 h-8" />}
                </div>
                <div className="text-xs font-semibold text-[#3498DB] uppercase tracking-wider mb-1">
                  {testMode === 'ielts' ? 'IELTS Diagnostic Mock Examination Completed' : 'Examination Completed'}
                </div>

                {testMode === 'ielts' ? (
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                        Official Estimated IELTS Band Score
                      </span>
                      <h2 className="text-4xl sm:text-5xl font-extrabold text-[#2C3E50] mt-1">
                        Band <span className="font-mono tabular-nums text-[#3498DB]">{ieltsBand.band.toFixed(1)}</span>
                        <span className="text-lg font-normal text-[#64748B]"> / 9.0</span>
                      </h2>
                      <div className="inline-flex items-center gap-2 mt-2 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{ieltsBand.label} · {ieltsBand.cefr}</span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto leading-relaxed">
                      {ieltsBand.summary}
                    </p>

                    <div className="pt-2 max-w-lg mx-auto">
                      <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
                        IELTS 9-Band Scale Placement
                      </div>
                      <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-mono">
                        {[
                          { band: 9.0, label: 'Expert' },
                          { band: 8.0, label: 'Very Good' },
                          { band: 7.0, label: 'Good' },
                          { band: 6.0, label: 'Competent' },
                          { band: 5.0, label: 'Modest' },
                        ].map((b) => {
                          const isCurrent = Math.floor(ieltsBand.band) === Math.floor(b.band);
                          return (
                            <div
                              key={b.band}
                              className={`p-2 rounded-lg border transition-all ${
                                isCurrent
                                  ? 'bg-[#3498DB] text-white border-[#2980B9] font-bold shadow-xs scale-105'
                                  : 'bg-white text-[#64748B] border-[#E1EFF7]'
                              }`}
                            >
                              <div className="font-bold text-xs">{b.band.toFixed(1)}</div>
                              <div className="text-[9px] truncate">{b.label}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 max-w-lg mx-auto text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-[#E1EFF7]">
                        <div className="text-[#64748B] text-[10px]">Reading</div>
                        <div className="font-mono font-bold text-[#2C3E50] text-sm">
                          Band {Math.min(9.0, ieltsBand.band + 0.5).toFixed(1)}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-[#E1EFF7]">
                        <div className="text-[#64748B] text-[10px]">Listening</div>
                        <div className="font-mono font-bold text-[#2C3E50] text-sm">
                          Band {ieltsBand.band.toFixed(1)}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-[#E1EFF7]">
                        <div className="text-[#64748B] text-[10px]">Writing</div>
                        <div className="font-mono font-bold text-[#2C3E50] text-sm">
                          Band {Math.max(5.0, ieltsBand.band - 0.5).toFixed(1)}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-[#E1EFF7]">
                        <div className="text-[#64748B] text-[10px]">Speaking</div>
                        <div className="font-mono font-bold text-[#2C3E50] text-sm">
                          Band {ieltsBand.band.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2C3E50]">
                      Your Score: <span className="font-mono tabular-nums">{scorePercent}%</span>
                    </h2>
                    <p className="text-sm text-[#64748B] mt-1">
                      You answered {correctCount} out of {questions.length} questions correctly.
                    </p>

                    <div className="inline-flex items-center gap-2 mt-4 px-3.5 py-1.5 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        {scorePercent >= 75 ? 'PASSED · Exceeds Board Cutoff' : 'NEEDS REVIEW · Below 75% Cutoff'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    variant="secondary"
                    size="md"
                    icon={<RotateCcw className="w-4 h-4" />}
                    onClick={handleRetake}
                  >
                    Retake Exam
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    icon={<Sparkles className="w-4 h-4" />}
                    onClick={() => onNavigate('ai-reviewer')}
                  >
                    Ask AI Reviewer to Explain Weak Points
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => onNavigate('student-dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </Card>

              {missedQuestions.length > 0 && (
                <Card className="border-amber-200 bg-amber-50/40">
                  <CardHeader
                    title="Recommended Topics to Review"
                    subtitle="Focus study time on items where your response did not match the correct answer"
                  />
                  <CardBody className="space-y-3">
                    {missedQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-xl bg-white border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="text-xs font-bold text-[#2C3E50]">{q.subject}</div>
                          <div className="text-xs text-[#64748B] mt-0.5">{q.question.slice(0, 90)}...</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigate('ai-reviewer')}
                          className="shrink-0 text-xs"
                        >
                          Study with AI
                        </Button>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-[#2C3E50]">
                  Detailed Question Review & Rationales
                </h3>

                {questions.map((q, idx) => {
                  const userChoice = userAnswers[q.id];
                  const isCorrect = userChoice === q.correctIndex;

                  return (
                    <Card
                      key={q.id}
                      className={`border ${isCorrect ? 'border-emerald-200' : 'border-rose-200'}`}
                    >
                      <CardBody className="p-6 space-y-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#2C3E50]">
                            Item {idx + 1} · {q.subject}
                          </span>
                          <div className="flex items-center gap-1.5 font-bold">
                            {isCorrect ? (
                              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                              </span>
                            ) : (
                              <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" /> Incorrect
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-sm font-semibold text-[#2C3E50]">{q.question}</p>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const letter = String.fromCharCode(65 + optIdx);
                            const isCorrectOption = optIdx === q.correctIndex;
                            const isSelectedByStudent = optIdx === userChoice;

                            let style = 'bg-[#FAFDFE] border-[#E1EFF7] text-[#2C3E50]';
                            if (isCorrectOption) {
                              style = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold';
                            } else if (isSelectedByStudent && !isCorrect) {
                              style = 'bg-rose-50 border-rose-300 text-rose-900 line-through';
                            }

                            return (
                              <div
                                key={optIdx}
                                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${style}`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold">{letter}.</span>
                                  <span>{opt}</span>
                                </div>
                                {isCorrectOption && (
                                  <span className="text-[10px] font-bold text-emerald-700 uppercase">
                                    Verified Correct Answer
                                  </span>
                                )}
                                {isSelectedByStudent && !isCorrect && (
                                  <span className="text-[10px] font-bold text-rose-700 uppercase">
                                    Your Selection
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#F4FAFD] border border-[#D6ECFA] text-xs text-[#2C3E50] leading-relaxed">
                          <strong className="text-[#3498DB]">Official Rationale: </strong>
                          {q.explanation}
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal before Submit */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Submit Examination?"
        subtitle="Review your submission readiness"
        maxWidth="md"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setIsConfirmModalOpen(false)}>
              Keep Reviewing
            </Button>
            <Button variant="primary" size="md" onClick={handleSubmitQuiz}>
              Confirm Submission
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-[#2C3E50]">
          <p>
            You have answered <strong>{answeredCount}</strong> out of{' '}
            <strong>{questions.length}</strong> questions.
          </p>
          {answeredCount < questions.length && (
            <p className="text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              ⚠️ You still have {questions.length - answeredCount} unanswered question(s). Unanswered questions will be scored as incorrect.
            </p>
          )}
          <p className="text-[#64748B]">
            Once submitted, your final score, question rationales, and recommended review topics will be generated instantly.
          </p>
        </div>
      </Modal>
    </div>
  );
};
