/**
 * CONTENT BANK — content only. No formatting, spacing, or layout decisions here.
 * Layout/format is decided exclusively by the engines + print CSS.
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

const LEVELS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

export const SUBJECTS: SubjectEntry[] = [
  { id: 'biology', name: 'Biology', code: '712', levels: LEVELS, items: BIOLOGY_ITEMS },
  { id: 'chemistry', name: 'Chemistry', code: '713', levels: LEVELS, items: CHEMISTRY_ITEMS },
  { id: 'physics', name: 'Physics', code: '711', levels: LEVELS, items: PHYSICS_ITEMS },
  { id: 'mathematics', name: 'Mathematics', code: '311', levels: LEVELS, items: MATHEMATICS_ITEMS },
  { id: 'english', name: 'English', code: '111', levels: LEVELS, items: ENGLISH_ITEMS },
  {
    id: 'entrepreneurship',
    name: 'Entrepreneurship',
    code: '520',
    levels: LEVELS,
    items: ENTREPRENEURSHIP_ITEMS,
  },
];

export function getSubject(id: string): SubjectEntry {
  return SUBJECTS.find((s) => s.id === id) ?? SUBJECTS[0];
}
