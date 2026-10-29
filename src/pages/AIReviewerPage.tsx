import React, { useState } from 'react';
import { ActivePage, Flashcard, ChatMessage } from '../types';
import { sampleFlashcards, sampleSummaryContent } from '../data/mockData';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import {
  Sparkles,
  UploadCloud,
  FileText,
  Send,
  Layers,
  BookMarked,
  CheckCircle2,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Plus,
  HelpCircle,
  Clock,
  Check
} from 'lucide-react';

interface AIReviewerPageProps {
  onNavigate: (page: ActivePage) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const AIReviewerPage: React.FC<AIReviewerPageProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: "Hello Alyssa! I am your ReviewHub AI Study Copilot. I've indexed your uploaded materials for 'Module 4: Thermodynamics & Fluid Transport'. How can I help your exam preparation today?",
      timestamp: '10:04 AM',
    },
    {
      id: 'msg-2',
      sender: 'user',
      text: 'Can you generate an executive summary and explain why the second law of thermodynamics forbids 100% heat conversion?',
      timestamp: '10:05 AM',
    },
    {
      id: 'msg-3',
      sender: 'ai',
      text: 'According to Kelvin-Planck statement of the Second Law, no cyclic heat engine can convert all absorbed heat purely into mechanical work without discharging some heat to a lower-temperature reservoir (Q_cold > 0). If it did, entropy generation would be negative, violating the second law! I have also prepared your executive summary card, flashcards, and a 3-question drill.',
      timestamp: '10:05 AM',
      suggestedAction: {
        label: 'View Generated Summary Card',
        actionType: 'summary',
      },
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string>('Lecture_04_Thermo_Fluids_Notes.pdf');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Active Tool View: 'chat' | 'summary' | 'flashcards' | 'quiz'
  const [activeViewTab, setActiveViewTab] = useState<'chat' | 'summary' | 'flashcards' | 'quiz'>('chat');

  // Flashcards State
  const [flashcards, setFlashcards] = useState<Flashcard[]>(sampleFlashcards);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Generated Quiz State
  const [userMiniQuizAnswers, setUserMiniQuizAnswers] = useState<Record<number, number>>({});
  const [miniQuizSubmitted, setMiniQuizSubmitted] = useState(false);

  const miniQuiz = [
    {
      id: 1,
      q: 'Which cycle has the maximum theoretical thermal efficiency between two heat reservoirs?',
      options: ['Rankine Cycle', 'Carnot Cycle', 'Diesel Cycle', 'Otto Cycle'],
      correct: 1,
      rationale: 'The Carnot cycle consists of two reversible isothermal and two reversible adiabatic processes, representing the upper theoretical efficiency limit.',
    },
    {
      id: 2,
      q: 'At what Reynolds number (Re) does circular pipe flow transition from laminar to transitional?',
      options: ['Re = 500', 'Re = 2,100', 'Re = 4,000', 'Re = 10,000'],
      correct: 1,
      rationale: 'Under standard conditions in circular conduits, flow is laminar below Re ~ 2,100.',
    },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      let aiResponseText = `I have analyzed your request based on "${uploadedFile}". In board exams, examiners frequently test this topic. Make sure to remember the underlying boundary assumptions and keep units in SI.`;
      let suggestedAction: ChatMessage['suggestedAction'] = undefined;

      if (userMsg.text.toLowerCase().includes('quiz') || userMsg.text.toLowerCase().includes('question')) {
        aiResponseText = `I've prepared a targeted mini-quiz with 2 rationalized questions based on your latest question. Check out the Generated Quiz tab!`;
        suggestedAction = { label: 'Go to Generated Quiz', actionType: 'quiz' };
      } else if (userMsg.text.toLowerCase().includes('card') || userMsg.text.toLowerCase().includes('flash')) {
        aiResponseText = `I've synthesized 5 high-yield flashcards covering key definitions and formulas from your uploaded notes.`;
        suggestedAction = { label: 'Open Flashcards Deck', actionType: 'flashcards' };
      } else if (userMsg.text.toLowerCase().includes('summary') || userMsg.text.toLowerCase().includes('summarize')) {
        aiResponseText = `Here is your synthesized summary highlighting core principles, high-yield formulas, and faculty tips.`;
        suggestedAction = { label: 'View Generated Summary', actionType: 'summary' };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          text: aiResponseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedAction,
        },
      ]);
      setIsTyping(false);
    }, 700);
  };

  const handleToggleMastered = (id: string) => {
    setFlashcards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, mastered: !c.mastered } : c))
    );
    onShowToast('Updated Flashcard Status', 'Your review mastery has been saved.', 'success');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E1EFF7]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#3498DB] mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Reviewer & Learning Assistant</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#2C3E50]">
            ReviewHub AI Study Copilot
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Active Document: <strong className="text-[#2C3E50]">{uploadedFile}</strong> · 24 Pages Parsed
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={<UploadCloud className="w-4 h-4" />}
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload Reviewer Material
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              onShowToast('Summary Refreshed', 'AI generated a fresh digest based on latest syllabus.', 'success');
              setActiveViewTab('summary');
            }}
          >
            Regenerate Summary
          </Button>
        </div>
      </div>

      {/* Navigation Segment Tabs between Copilot Views */}
      <div className="flex items-center gap-2 border-b border-[#E1EFF7] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveViewTab('chat')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 ${
            activeViewTab === 'chat'
              ? 'bg-[#3498DB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#2C3E50] hover:bg-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Interactive Chat</span>
        </button>
        <button
          onClick={() => setActiveViewTab('summary')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 ${
            activeViewTab === 'summary'
              ? 'bg-[#3498DB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#2C3E50] hover:bg-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Generated Summary Card</span>
        </button>
        <button
          onClick={() => setActiveViewTab('flashcards')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 ${
            activeViewTab === 'flashcards'
              ? 'bg-[#3498DB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#2C3E50] hover:bg-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Flashcard Section ({flashcards.length})</span>
        </button>
        <button
          onClick={() => setActiveViewTab('quiz')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 ${
            activeViewTab === 'quiz'
              ? 'bg-[#3498DB] text-white shadow-xs'
              : 'text-[#64748B] hover:text-[#2C3E50] hover:bg-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Generated Quiz ({miniQuiz.length} Questions)</span>
        </button>
      </div>

      {/* Main Content Area based on Tab */}

      {/* VIEW 1: CHAT INTERFACE */}
      {activeViewTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col h-[600px] bg-white rounded-2xl border border-[#E1EFF7] shadow-xs overflow-hidden">
            {/* Chat Messages Log */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#FAFDFE]">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-[#94A3B8]">
                      <span>{isUser ? 'You' : 'ReviewHub AI'}</span>
                      <span>·</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isUser
                          ? 'bg-[#3498DB] text-white rounded-tr-xs shadow-xs'
                          : 'bg-white text-[#2C3E50] border border-[#D6ECFA] rounded-tl-xs shadow-xs'
                      }`}
                    >
                      {msg.text}
                      {msg.suggestedAction && (
                        <div className="mt-3 pt-2.5 border-t border-[#E1EFF7]">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setActiveViewTab(msg.suggestedAction!.actionType)}
                            className="bg-[#F4FAFD] border-[#BCE0F7] text-[#2980B9] text-xs"
                          >
                            {msg.suggestedAction.label}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-[#64748B] p-2 bg-white rounded-xl border border-[#D6ECFA] w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-[#3498DB] animate-spin" />
                  <span>AI Reviewer is analyzing lecture notes...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Starters */}
            <div className="px-5 py-2.5 bg-white border-t border-[#F0F6FA] flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-[#64748B] font-medium shrink-0">Quick prompts:</span>
              <button
                onClick={() => setInputMessage('Summarize the top 5 formulas for the upcoming board exam')}
                className="px-2.5 py-1 rounded-lg bg-[#F4FAFD] hover:bg-[#D6ECFA]/50 text-[#3498DB] shrink-0 border border-[#D6ECFA] transition-colors cursor-pointer"
              >
                Top 5 Formulas
              </button>
              <button
                onClick={() => setInputMessage('Generate 3 tricky multiple-choice questions on pipe head loss')}
                className="px-2.5 py-1 rounded-lg bg-[#F4FAFD] hover:bg-[#D6ECFA]/50 text-[#3498DB] shrink-0 border border-[#D6ECFA] transition-colors cursor-pointer"
              >
                Generate 3 Practice Questions
              </button>
              <button
                onClick={() => setInputMessage('Create flashcards on Bernoulli equation assumptions')}
                className="px-2.5 py-1 rounded-lg bg-[#F4FAFD] hover:bg-[#D6ECFA]/50 text-[#3498DB] shrink-0 border border-[#D6ECFA] transition-colors cursor-pointer"
              >
                Bernoulli Assumptions Flashcards
              </button>
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-[#E1EFF7] flex items-center gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask ReviewHub AI about definitions, formulas, or tricky board exam questions..."
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-[#D6ECFA] focus:outline-none focus:ring-2 focus:ring-[#3498DB] bg-[#FAFDFE]"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!inputMessage.trim()}
                icon={<Send className="w-4 h-4" />}
              >
                Send
              </Button>
            </form>
          </div>

          {/* Right Sidebar: Active Reviewer Material & Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader title="Current Source Document" subtitle="Indexed by Meliora AI" />
              <CardBody className="space-y-4">
                <div className="p-3.5 rounded-xl bg-[#F4FAFD] border border-[#D6ECFA] flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#3498DB] text-white shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#2C3E50] truncate">{uploadedFile}</p>
                    <p className="text-[11px] text-[#64748B]">24 Pages · OCR Text Extracted</p>
                    <span className="inline-block mt-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      High-Yield Verified
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<FileText className="w-4 h-4 text-[#3498DB]" />}
                    onClick={() => setActiveViewTab('summary')}
                    className="w-full justify-start"
                  >
                    Open Summary Card
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Layers className="w-4 h-4 text-[#3498DB]" />}
                    onClick={() => setActiveViewTab('flashcards')}
                    className="w-full justify-start"
                  >
                    Open Flashcards ({flashcards.length})
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<HelpCircle className="w-4 h-4 text-[#3498DB]" />}
                    onClick={() => setActiveViewTab('quiz')}
                    className="w-full justify-start"
                  >
                    Take Generated Quiz
                  </Button>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-br from-[#D6ECFA]/40 to-white">
              <CardBody className="p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#2C3E50] mb-2">
                  <Sparkles className="w-4 h-4 text-[#3498DB]" />
                  <span>AI Study Recommendation</span>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                  Reviewees who drill the 4 Bernoulli streamline assumptions retain 35% higher accuracy on pressure gradient problems.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setInputMessage('Explain the 4 assumptions required for Bernoulli equation');
                  }}
                  className="w-full justify-center"
                >
                  Prompt AI About Bernoulli
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* VIEW 2: GENERATED SUMMARY CARD */}
      {activeViewTab === 'summary' && (
        <Card className="border-[#D6ECFA] shadow-xs">
          <CardHeader
            title={sampleSummaryContent.title}
            subtitle={sampleSummaryContent.generatedAt}
            action={
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Copy className="w-4 h-4" />}
                  onClick={() => {
                    onShowToast('Copied to Clipboard', 'Summary key takeaways copied.', 'success');
                  }}
                >
                  Copy
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => {
                    onShowToast('PDF Export Initiated', 'Downloading formatted summary sheet.', 'info');
                  }}
                >
                  Export PDF
                </Button>
              </div>
            }
          />
          <CardBody className="p-6 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-[#2C3E50] uppercase tracking-wider mb-3">
                Key Exam Takeaways
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sampleSummaryContent.keyTakeaways.map((point, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-[#FAFDFE] border border-[#E1EFF7] text-xs text-[#2C3E50] flex items-start gap-2.5"
                  >
                    <Check className="w-4 h-4 text-[#3498DB] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-[#2C3E50] uppercase tracking-wider mb-3">
                High-Yield Formulas & Constants
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sampleSummaryContent.highYieldFormulas.map((formula, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-[#F4FAFD] border border-[#D6ECFA] font-mono text-xs text-[#2C3E50] font-semibold"
                  >
                    {formula}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
              <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-1">
                Meliora Faculty Exam Traps & Tips
              </h5>
              <ul className="text-xs text-amber-900 space-y-1 list-disc pl-4">
                {sampleSummaryContent.recommendedReviewFocus.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          </CardBody>
        </Card>
      )}

      {/* VIEW 3: FLASHCARDS SECTION */}
      {activeViewTab === 'flashcards' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between text-xs text-[#64748B]">
            <span className="font-semibold text-[#2C3E50]">
              Card {currentCardIdx + 1} of {flashcards.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#3498DB]">
                Topic: {flashcards[currentCardIdx].topic}
              </span>
              <span>·</span>
              <span className={flashcards[currentCardIdx].mastered ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                {flashcards[currentCardIdx].mastered ? 'Mastered' : 'Needs Practice'}
              </span>
            </div>
          </div>

          {/* Interactive Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-80 bg-white rounded-3xl border-2 border-[#D6ECFA] shadow-md p-8 flex flex-col justify-between items-center text-center cursor-pointer hover:border-[#3498DB] transition-all select-none relative group"
          >
            <div className="w-full flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="font-semibold uppercase tracking-wider text-[#3498DB]">
                {isFlipped ? 'Answer & Rationale' : 'Question / Concept'}
              </span>
              <span className="inline-flex items-center gap-1 group-hover:text-[#3498DB] transition-colors">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Click to Flip</span>
              </span>
            </div>

            <div className="my-auto px-4">
              <p className="text-lg sm:text-xl font-bold text-[#2C3E50] leading-relaxed">
                {isFlipped
                  ? flashcards[currentCardIdx].back
                  : flashcards[currentCardIdx].front}
              </p>
            </div>

            <div className="w-full text-xs text-[#94A3B8]">
              {isFlipped ? 'Tap anywhere to review question' : 'Tap anywhere to reveal verified answer'}
            </div>
          </div>

          {/* Controls: Prev, Master toggle, Next */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="secondary"
              size="md"
              icon={<ChevronLeft className="w-4 h-4" />}
              disabled={currentCardIdx === 0}
              onClick={() => {
                setIsFlipped(false);
                setCurrentCardIdx((prev) => Math.max(0, prev - 1));
              }}
            >
              Previous Card
            </Button>

            <Button
              variant={flashcards[currentCardIdx].mastered ? 'secondary' : 'outline'}
              size="md"
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              onClick={() => handleToggleMastered(flashcards[currentCardIdx].id)}
            >
              {flashcards[currentCardIdx].mastered ? 'Mark as Reviewing' : 'Mark as Mastered'}
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={<ChevronRight className="w-4 h-4" />}
              iconPosition="right"
              disabled={currentCardIdx === flashcards.length - 1}
              onClick={() => {
                setIsFlipped(false);
                setCurrentCardIdx((prev) => Math.min(flashcards.length - 1, prev + 1));
              }}
            >
              Next Card
            </Button>
          </div>
        </div>
      )}

      {/* VIEW 4: GENERATED QUIZ SECTION */}
      {activeViewTab === 'quiz' && (
        <Card className="max-w-3xl mx-auto border-[#D6ECFA]">
          <CardHeader
            title="AI-Generated Knowledge Check"
            subtitle="2 high-yield diagnostic questions dynamically generated from your notes"
          />
          <CardBody className="p-6 space-y-8">
            {miniQuiz.map((item, qIdx) => {
              const selectedAnswer = userMiniQuizAnswers[item.id];
              const isCorrect = selectedAnswer === item.correct;

              return (
                <div key={item.id} className="p-5 rounded-2xl bg-[#FAFDFE] border border-[#E1EFF7] space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#3498DB]">Item {qIdx + 1} of {miniQuiz.length}</span>
                    {miniQuizSubmitted && (
                      <span className={`font-semibold ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-[#2C3E50]">{item.q}</h4>

                  <div className="space-y-2">
                    {item.options.map((option, optIdx) => {
                      const isSelected = selectedAnswer === optIdx;
                      let btnStyle = 'bg-white border-[#D6ECFA] text-[#2C3E50] hover:bg-[#F4FAFD]';

                      if (miniQuizSubmitted) {
                        if (optIdx === item.correct) {
                          btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-rose-50 border-rose-400 text-rose-900';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-[#D6ECFA] border-[#3498DB] text-[#2980B9] font-semibold';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={miniQuizSubmitted}
                          onClick={() => {
                            setUserMiniQuizAnswers({ ...userMiniQuizAnswers, [item.id]: optIdx });
                          }}
                          className={`w-full p-3.5 text-left text-xs sm:text-sm rounded-xl border transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                        >
                          <span>{option}</span>
                          {miniQuizSubmitted && optIdx === item.correct && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {miniQuizSubmitted && (
                    <div className="p-3 bg-white rounded-xl border border-[#D6ECFA] text-xs text-[#64748B]">
                      <strong className="text-[#2C3E50]">Rationale:</strong> {item.rationale}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-2 flex items-center justify-between">
              {!miniQuizSubmitted ? (
                <Button
                  variant="primary"
                  size="md"
                  disabled={Object.keys(userMiniQuizAnswers).length < miniQuiz.length}
                  onClick={() => {
                    setMiniQuizSubmitted(true);
                    onShowToast('Mini-Quiz Graded', 'Check explanations below for verified review!', 'success');
                  }}
                  className="w-full justify-center"
                >
                  Submit & Check Answers
                </Button>
              ) : (
                <div className="w-full flex items-center justify-between gap-4">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setUserMiniQuizAnswers({});
                      setMiniQuizSubmitted(false);
                    }}
                  >
                    Reset & Retake
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => onNavigate('quiz')}
                  >
                    Proceed to Full Mock Examination
                  </Button>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Upload Material Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Reviewer Material"
        subtitle="Upload textbooks, syllabi, notes, or past papers (PDF, DOCX, TXT)"
        maxWidth="lg"
        footer={
          <>
            <Button variant="secondary" size="md" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setIsUploadModalOpen(false);
                onShowToast('Material Uploaded', `Indexed "${uploadedFile}" successfully!`, 'success');
                setActiveViewTab('summary');
              }}
            >
              Parse & Generate AI Aids
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-[#5DADE2] rounded-2xl p-8 text-center bg-[#F4FAFD]/50 hover:bg-[#F4FAFD] transition-colors cursor-pointer">
            <UploadCloud className="w-10 h-10 text-[#3498DB] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#2C3E50]">
              Drag and drop lecture slides or reviewer notes
            </p>
            <p className="text-xs text-[#64748B] mt-1">Supports PDF, PPTX, DOCX, TXT up to 50MB</p>
          </div>

          <div>
            <div className="text-xs font-bold text-[#2C3E50] mb-2 uppercase tracking-wider">
              Or Choose Pre-Loaded Meliora Materials
            </div>
            <div className="space-y-2">
              {[
                'Lecture_04_Thermo_Fluids_Notes.pdf',
                'Philippine_Constitution_Bill_of_Rights_Digest.docx',
                'Comprehensive_Organic_Synthesis_Reaction_Map.pdf',
              ].map((name, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setUploadedFile(name)}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                    uploadedFile === name
                      ? 'border-[#3498DB] bg-[#D6ECFA]/40 text-[#2980B9] font-bold'
                      : 'border-[#E1EFF7] bg-white text-[#2C3E50] hover:bg-[#F4FAFD]'
                  }`}
                >
                  <span className="truncate">{name}</span>
                  {uploadedFile === name && <Check className="w-4 h-4 text-[#3498DB] shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
