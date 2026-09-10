/**
 * PAST PAPER LIBRARY (browser)
 *
 * Uploaded papers stay on the teacher's own device. Only the small library
 * reference (subject + level + paper ids) travels inside the exam id.
 */
import type { PastPaper, PastPaperSummary } from './types';

const INDEX_KEY = 'nesa.pastPapers';
const paperKey = (id: string) => `nesa.pastPaper:${id}`;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function listPapers(): PastPaperSummary[] {
  if (typeof localStorage === 'undefined') return [];
  return safeParse<PastPaperSummary[]>(localStorage.getItem(INDEX_KEY), []);
}

export function listPapersFor(subjectId: string, level: string): PastPaperSummary[] {
  return listPapers().filter((p) => p.subjectId === subjectId && p.level === level);
}

export function loadPaper(id: string): PastPaper | undefined {
  if (typeof localStorage === 'undefined') return undefined;
  return safeParse<PastPaper | undefined>(localStorage.getItem(paperKey(id)), undefined);
}

export function loadPapersFor(subjectId: string, level: string): PastPaper[] {
  return listPapersFor(subjectId, level)
    .map((s) => loadPaper(s.id))
    .filter((p): p is PastPaper => Boolean(p));
}

export function summarise(paper: PastPaper): PastPaperSummary {
  const questions = paper.sections.flatMap((s) => s.questions);
  return {
    id: paper.id,
    subjectId: paper.subjectId,
    level: paper.level,
    year: paper.year,
    fileName: paper.fileName,
    createdAt: paper.createdAt,
    sectionCount: paper.sections.length,
    questionCount: questions.length,
    reviewCount: questions.filter((q) => q.needsReview).length,
  };
}

export function savePaper(paper: PastPaper): PastPaperSummary[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    localStorage.setItem(paperKey(paper.id), JSON.stringify(paper));
  } catch {
    throw new Error('This device has no room left for another paper. Remove one first.');
  }
  const next = [summarise(paper), ...listPapers().filter((p) => p.id !== paper.id)].slice(0, 30);
  localStorage.setItem(INDEX_KEY, JSON.stringify(next));
  return next;
}

export function deletePaper(id: string): PastPaperSummary[] {
  if (typeof localStorage === 'undefined') return [];
  localStorage.removeItem(paperKey(id));
  const next = listPapers().filter((p) => p.id !== id);
  localStorage.setItem(INDEX_KEY, JSON.stringify(next));
  return next;
}

export function newPaperId(): string {
  return `pp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
