/**
 * TEACHER EDITS
 *
 * Once a paper is generated the teacher owns it. Any manual edit is stored as a
 * full snapshot of the exam + marking guide against the exam id, so the
 * preview, print view and marking guide all render exactly what was edited.
 */
import type { GeneratedExam, GeneratedMarkingGuide } from '../types';

export interface EditedPaper {
  exam: GeneratedExam;
  markingGuide: GeneratedMarkingGuide;
  savedAt: string;
}

const key = (id: string) => `exam-edits:${id}`;

export function loadEdits(id: string): EditedPaper | undefined {
  if (typeof localStorage === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(key(id));
    return raw ? (JSON.parse(raw) as EditedPaper) : undefined;
  } catch {
    return undefined;
  }
}

export function saveEdits(
  id: string,
  exam: GeneratedExam,
  markingGuide: GeneratedMarkingGuide,
): EditedPaper {
  const payload: EditedPaper = { exam, markingGuide, savedAt: new Date().toISOString() };
  try {
    localStorage.setItem(key(id), JSON.stringify(payload));
  } catch {
    /* storage full or blocked — the in-session state still holds */
  }
  return payload;
}

export function clearEdits(id: string) {
  try {
    localStorage.removeItem(key(id));
  } catch {
    /* ignore */
  }
}

/** Structured clone that works for the plain-JSON exam shape. */
export function cloneExam<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Recompute section and paper totals after any mark change. */
export function recalcMarks(exam: GeneratedExam): GeneratedExam {
  exam.sections.forEach((section) => {
    section.marks = section.questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
  });
  exam.header.marks = exam.sections.reduce((sum, s) => sum + (Number(s.marks) || 0), 0);
  return exam;
}
