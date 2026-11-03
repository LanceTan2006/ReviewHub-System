import type { Lesson } from '../types';
import { supabase } from './supabase';

export const LESSON_FILES_BUCKET = 'lesson-files';
const MAX_PDF_BYTES = 20 * 1024 * 1024;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function isPdf(file: File) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

async function insertLessonMaterialRow(row: {
  lesson_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
}) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.from('lesson_materials').insert([row]);
  if (!error) return;

  const fallback = await supabase.from('lesson_material').insert([row]);
  if (fallback.error) {
    throw new Error(error.message);
  }
}

export async function createLessonWithPdfs(
  lesson: Lesson,
  files: File[],
  packageId?: string | null
) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('You must be signed in to upload lesson files.');
  }

  const pdfs = files.filter(isPdf);
  if (pdfs.length !== files.length) {
    throw new Error('Only PDF files can be attached to a lesson.');
  }

  const oversized = pdfs.find((file) => file.size > MAX_PDF_BYTES);
  if (oversized) {
    throw new Error(`"${oversized.name}" exceeds the 20 MB limit.`);
  }

  const lessonId = lesson.id?.startsWith('les-') ? crypto.randomUUID() : lesson.id || crypto.randomUUID();
  const linkedPackageId =
    packageId && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(packageId)
      ? packageId
      : null;

  const { error: insertError } = await supabase.from('lessons').insert([
    {
      id: lessonId,
      package_id: linkedPackageId,
      title: lesson.title,
      subject: lesson.subject,
      duration: lesson.duration,
      completed: lesson.completed,
      progress_percent: lesson.progressPercent,
      instructor: lesson.instructor,
      materials_count: lesson.materialsCount,
      next_quiz_available: lesson.nextQuizAvailable,
      content_summary: lesson.contentSummary ?? '',
      key_takeaways: lesson.keyTakeaways ?? [],
    },
  ]);

  if (insertError) {
    throw new Error(insertError.message);
  }

  for (const file of pdfs) {
    const path = `${lessonId}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(LESSON_FILES_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'application/pdf',
      });

    if (uploadError) {
      throw new Error(`Could not upload "${file.name}": ${uploadError.message}`);
    }

    await insertLessonMaterialRow({
      lesson_id: lessonId,
      file_name: file.name,
      file_path: path,
      file_size: file.size,
      mime_type: 'application/pdf',
    });
  }

  return { lessonId };
}
