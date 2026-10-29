import React, { useState } from 'react';
import { ActivePage, Lesson } from '../types';
import { sampleLessons } from '../data/mockData';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import {
  BookOpen,
  Play,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  Filter,
  Download,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface LessonsPageProps {
  onNavigate: (page: ActivePage) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

export const LessonsPage: React.FC<LessonsPageProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [lessons] = useState<Lesson[]>(sampleLessons);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const subjects = ['All', 'General Engineering Sciences', 'Professional Ethics & Law', 'Applied Physical Sciences', 'Applied Mathematics', 'Chemical Sciences'];

  const filtered = lessons.filter((l) => {
    const matchesSearch = l.title.toLowerCase().includes(search.toLowerCase()) || l.instructor.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || l.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E1EFF7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#3498DB] mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Curriculum Modules & Recorded Lectures</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#2C3E50]">
            Review Course Modules
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Access high-yield video lectures, downloadable review notes, and diagnostic checkpoint quizzes.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          icon={<Sparkles className="w-4 h-4" />}
          onClick={() => onNavigate('ai-reviewer')}
        >
          Generate Summary with AI
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E1EFF7] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lessons or instructors..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#D6ECFA] focus:outline-none focus:ring-2 focus:ring-[#3498DB]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[#64748B] shrink-0 font-medium">Domain:</span>
          {subjects.slice(0, 4).map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedSubject === sub
                  ? 'bg-[#3498DB] text-white font-semibold shadow-xs'
                  : 'bg-[#F4FAFD] text-[#64748B] hover:text-[#2C3E50] border border-[#E1EFF7]'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Lesson List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((lesson) => (
          <Card key={lesson.id} hoverable className="border-[#E1EFF7] flex flex-col justify-between">
            <CardBody className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#3498DB] font-semibold">{lesson.subject}</span>
                <span className="flex items-center gap-1 text-[#64748B]">
                  <Clock className="w-3 h-3" />
                  {lesson.duration}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#2C3E50] mb-1">{lesson.title}</h3>
                <p className="text-xs text-[#64748B]">Faculty: {lesson.instructor}</p>
              </div>

              <div className="space-y-1.5 pt-2">
                <ProgressBar
                  value={lesson.progressPercent}
                  label={lesson.completed ? 'Completed' : 'Module Progress'}
                  size="sm"
                  color={lesson.completed ? 'bg-emerald-500' : 'bg-[#3498DB]'}
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#F0F6FA]">
                <span className="text-xs text-[#64748B]">
                  {lesson.materialsCount} Reviewer Files Attached
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant={lesson.completed ? 'secondary' : 'primary'}
                    size="sm"
                    icon={lesson.completed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Play className="w-3.5 h-3.5" />}
                    onClick={() => {
                      onShowToast(
                        lesson.completed ? 'Reviewing Video' : 'Playing Lecture',
                        `Opening ${lesson.title}`,
                        'info'
                      );
                    }}
                  >
                    {lesson.completed ? 'Rewatch' : lesson.progressPercent > 0 ? 'Resume' : 'Start'}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
