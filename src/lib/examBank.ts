/**
 * CONTENT BANK — content only. No formatting, spacing, or layout decisions here.
 * Layout/format is decided exclusively by the engines + print CSS.
 *
 * SUBJECT REGISTRY
 * Each subject declares the class levels at which it is actually examined in
 * the Rwandan system. A subject that only exists at Advanced Level (Literature
 * in English, Economics, General Studies) must never be offered at S1-S3, and
 * the level picker is driven from this list.
 */
import type { BankItem, BankType, SubjectEntry } from './bank/types';
import { mcq } from './bank/types';
import { BIOLOGY_ITEMS } from './bank/biology';
import { CHEMISTRY_ITEMS } from './bank/chemistry';
import { PHYSICS_ITEMS } from './bank/physics';
import { MATHEMATICS_ITEMS } from './bank/mathematics';
import { ENGLISH_ITEMS } from './bank/english';
import { ENTREPRENEURSHIP_ITEMS } from './bank/entrepreneurship';

export type { BankItem, BankType, SubjectEntry };
export { mcq };

/** Ordinary Level (lower secondary) classes. */
const OLEVEL = ['S1', 'S2', 'S3'];
/** Advanced Level (upper secondary) classes. */
const ALEVEL = ['S4', 'S5', 'S6'];
/** Full secondary cycle. */
const SECONDARY = [...OLEVEL, ...ALEVEL];

export const SUBJECTS: SubjectEntry[] = [
  /* ---------------- Languages ---------------- */
  { id: 'english', name: 'English', code: '111', levels: SECONDARY, items: ENGLISH_ITEMS },
  { id: 'kinyarwanda', name: 'Kinyarwanda', code: '121', levels: SECONDARY, items: [] },
  { id: 'french', name: 'Français', code: '131', levels: SECONDARY, items: [] },
  { id: 'kiswahili', name: 'Kiswahili', code: '141', levels: SECONDARY, items: [] },
  {
    id: 'literature',
    name: 'Literature in English',
    code: '112',
    levels: ALEVEL,
    items: [],
  },

  /* ---------------- Sciences and mathematics ---------------- */
  { id: 'mathematics', name: 'Mathematics', code: '311', levels: SECONDARY, items: MATHEMATICS_ITEMS },
  { id: 'biology', name: 'Biology', code: '712', levels: SECONDARY, items: BIOLOGY_ITEMS },
  { id: 'chemistry', name: 'Chemistry', code: '713', levels: SECONDARY, items: CHEMISTRY_ITEMS },
  { id: 'physics', name: 'Physics', code: '711', levels: SECONDARY, items: PHYSICS_ITEMS },
  { id: 'computerscience', name: 'Computer Science / ICT', code: '511', levels: SECONDARY, items: [] },

  /* ---------------- Humanities and business ---------------- */
  { id: 'geography', name: 'Geography', code: '211', levels: SECONDARY, items: [] },
  { id: 'history', name: 'History and Citizenship', code: '221', levels: SECONDARY, items: [] },
  {
    id: 'entrepreneurship',
    name: 'Entrepreneurship',
    code: '520',
    levels: SECONDARY,
    items: ENTREPRENEURSHIP_ITEMS,
  },
  { id: 'economics', name: 'Economics', code: '521', levels: ALEVEL, items: [] },
  {
    id: 'general_studies',
    name: 'General Studies and Communication Skills',
    code: '901',
    levels: ALEVEL,
    items: [],
  },
];

export function getSubject(id: string): SubjectEntry {
  return SUBJECTS.find((s) => s.id === id) ?? SUBJECTS[0];
}

/** Class levels at which this subject is examined. */
export function levelsForSubject(id: string): string[] {
  return getSubject(id).levels;
}

/** True when the subject is taught/examined at that class level. */
export function subjectHasLevel(id: string, level: string): boolean {
  return levelsForSubject(id).includes(level);
}
