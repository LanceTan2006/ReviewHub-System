import React, { useState, useEffect } from 'react';
import { ActivePage, Lesson, LessonMaterial } from '../types';
import { Card, CardBody } from '../components/Card';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { Modal } from '../components/Modal';
import {
  BookOpen,
  Play,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
  FileText,
  Download,
  Eye,
  HelpCircle,
} from 'lucide-react';
import {
  fetchLessons,
  fetchLessonMaterialsForLesson,
  getPdfUrl,
} from '../lib/services/packagesLessons';

interface LessonsPageProps {
  onNavigate: (page: ActivePage) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'error' | 'info') => void;
}

// ── Format file size ───────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const LessonsPage: React.FC<LessonsPageProps> = ({
  onNavigate,
  onShowToast,
}) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // PDF panel state
  const [materialsLesson, setMaterialsLesson] = useState<Lesson | null>(null);
  const [materials, setMaterials] = useState<LessonMaterial[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingPdfId, setLoadingPdfId] = useState<string | null>(null);

  // Inline PDF viewer state
  const [viewingPdf, setViewingPdf] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchLessons().then((data) => {
      if (isMounted) setLessons(data);
    });
    return () => { isMounted = false; };
  }, []);

  const subjects = [
    'All',
    'General Engineering Sciences',
    'Professional Ethics & Law',
    'Applied Physical Sciences',
    'Applied Mathematics',
    'Civil Service Review',
  ];

  const filtered = lessons.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.instructor.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject === 'All' || l.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  // ── Open the materials panel for a lesson ──────────────────
  const openMaterials = async (lesson: Lesson) => {
    setMaterialsLesson(lesson);
    setLoadingMaterials(true);
    setMaterials([]);

    // Use materials already embedded in lesson if available
    if (lesson.materials && lesson.materials.length > 0) {
      setMaterials(lesson.materials);
      setLoadingMaterials(false);
      return;
    }

    // Otherwise fetch from Supabase
    try {
      const fetched = await fetchLessonMaterialsForLesson(lesson.id);
      setMaterials(fetched);
    } catch {
      onShowToast('Error', 'Could not load lesson materials. Please try again.', 'error');
    } finally {
      setLoadingMaterials(false);
    }
  };

  // ── View a PDF inline ──────────────────────────────────────
  const handleViewPdf = async (material: LessonMaterial) => {
    setLoadingPdfId(material.id);
    try {
      const url = await getPdfUrl(material.objectPath);
      if (!url) throw new Error('Could not generate URL');
      setViewingPdf({ url, name: material.title || material.fileName });
    } catch {
      onShowToast('Cannot Open PDF', 'Failed to load the file. Check your Supabase configuration.', 'error');
    } finally {
      setLoadingPdfId(null);
    }
  };

  // ── Download a PDF ─────────────────────────────────────────
  const handleDownloadPdf = async (material: LessonMaterial) => {
    setLoadingPdfId(material.id);
    try {
      const url = await getPdfUrl(material.objectPath);
      if (!url) throw new Error('Could not generate URL');
      const a = document.createElement('a');
      a.href = url;
      a.download = material.fileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      onShowToast('Download Started', `Downloading ${material.fileName}`, 'success');
    } catch {
      onShowToast('Download Failed', 'Could not download the file. Check your Supabase configuration.', 'error');
    } finally {
      setLoadingPdfId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#E1EFF7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#3498DB] mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Curriculum Modules & Reviewer Materials</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#2C3E50]">Review Course Modules</h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Access lectures, downloadable PDF reviewer notes, and diagnostic quizzes.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="md"
            icon={<HelpCircle className="w-4 h-4" />}
            onClick={() => onNavigate('quiz')}
          >
            Take Practice Quiz
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={() => onNavigate('ai-reviewer')}
          >
            AI Reviewer
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
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

      {/* Lesson Cards */}
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

              {/* Action row */}
              <div className="pt-2 flex items-center justify-between border-t border-[#F0F6FA]">
                {/* Materials button */}
                <button
                  onClick={() => openMaterials(lesson)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3498DB] hover:text-[#2980B9] transition-colors cursor-pointer focus:outline-none"
                  aria-label={`View PDF materials for ${lesson.title}`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  {lesson.materialsCount > 0
                    ? `${lesson.materialsCount} PDF${lesson.materialsCount > 1 ? 's' : ''}`
                    : 'Materials'}
                </button>

                <div className="flex items-center gap-2">
                  {/* Practice Quiz shortcut */}
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<HelpCircle className="w-3.5 h-3.5" />}
                    onClick={() => onNavigate('quiz')}
                    className="text-[#64748B] hover:text-[#3498DB] text-xs"
                    aria-label="Take practice quiz"
                  >
                    Quiz
                  </Button>

                  {/* Watch / Resume */}
                  <Button
                    variant={lesson.completed ? 'secondary' : 'primary'}
                    size="sm"
                    icon={
                      lesson.completed
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        : <Play className="w-3.5 h-3.5" />
                    }
                    onClick={() =>
                      onShowToast(
                        lesson.completed ? 'Reviewing Lecture' : 'Playing Lecture',
                        `Opening: ${lesson.title}`,
                        'info'
                      )
                    }
                  >
                    {lesson.completed ? 'Rewatch' : lesson.progressPercent > 0 ? 'Resume' : 'Start'}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center text-[#64748B]">
            <BookOpen className="w-10 h-10 text-[#D6ECFA] mb-3" />
            <p className="text-sm font-semibold">No lessons found</p>
            <p className="text-xs mt-1">Try adjusting your search or subject filter.</p>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════
          PDF MATERIALS PANEL — slides open as a modal
          ════════════════════════════════════════════════════ */}
      {materialsLesson && (
        <Modal
          isOpen={!!materialsLesson}
          onClose={() => { setMaterialsLesson(null); setMaterials([]); }}
          title={`Lesson Materials`}
          subtitle={materialsLesson.title}
          maxWidth="lg"
          footer={
            <Button
              variant="secondary"
              size="md"
              onClick={() => { setMaterialsLesson(null); setMaterials([]); }}
            >
              Close
            </Button>
          }
        >
          {loadingMaterials ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-2 border-[#3498DB] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#64748B]">Loading materials from Supabase…</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <FileText className="w-12 h-12 text-[#D6ECFA]" />
              <p className="text-sm font-semibold text-[#2C3E50]">No PDF materials attached</p>
              <p className="text-xs text-[#64748B] max-w-xs">
                The instructor has not uploaded any PDF files for this lesson yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#64748B] mb-1">
                {materials.length} file{materials.length > 1 ? 's' : ''} attached to this lesson.
              </p>
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-[#F4FAFD] border border-[#E1EFF7] hover:border-[#BCE0F7] transition-colors"
                >
                  {/* PDF icon */}
                  <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-red-500" />
                  </div>

                  {/* File info */}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-[#2C3E50] truncate">{mat.title || mat.fileName}</div>
                    <div className="text-[11px] text-[#94A3B8] font-mono mt-0.5 truncate">
                      {mat.fileName} · {formatBytes(mat.fileSize)}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleViewPdf(mat)}
                      disabled={loadingPdfId === mat.id}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3498DB] hover:text-[#2980B9] px-3 py-2 rounded-lg hover:bg-[#D6ECFA]/40 transition-colors cursor-pointer disabled:opacity-50"
                      aria-label={`View ${mat.fileName}`}
                    >
                      {loadingPdfId === mat.id
                        ? <span className="w-3.5 h-3.5 border border-[#3498DB] border-t-transparent rounded-full animate-spin" />
                        : <Eye className="w-3.5 h-3.5" />
                      }
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadPdf(mat)}
                      disabled={loadingPdfId === mat.id}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-50"
                      aria-label={`Download ${mat.fileName}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* ════════════════════════════════════════════════════
          INLINE PDF VIEWER — full-screen modal
          ════════════════════════════════════════════════════ */}
      {viewingPdf && (
        <Modal
          isOpen={!!viewingPdf}
          onClose={() => setViewingPdf(null)}
          title={viewingPdf.name}
          subtitle="PDF Viewer"
          maxWidth="2xl"
          footer={
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setViewingPdf(null)}
              >
                Close Viewer
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={<Download className="w-4 h-4" />}
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = viewingPdf.url;
                  a.download = viewingPdf.name;
                  a.target = '_blank';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
              >
                Download PDF
              </Button>
            </div>
          }
        >
          {/* Native browser PDF embed */}
          <div className="w-full rounded-xl overflow-hidden border border-[#E1EFF7] bg-[#F4FAFD]"
               style={{ height: '70vh' }}>
            <iframe
              src={`${viewingPdf.url}#toolbar=1&view=FitH`}
              title={viewingPdf.name}
              className="w-full h-full border-0"
              aria-label={`PDF viewer: ${viewingPdf.name}`}
            />
          </div>
          <p className="text-[11px] text-[#94A3B8] text-center mt-2">
            If the PDF doesn't load, click "Download PDF" to open it in your browser.
          </p>
        </Modal>
      )}
    </div>
  );
};
