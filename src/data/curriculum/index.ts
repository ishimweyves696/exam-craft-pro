/**
 * CURRICULUM MAP — registry and lookups.
 *
 * One verified REB/CBC map per subject, per level (S1–S6), with the units in
 * teaching order, the term each unit is taught in, its sub-topics, and the
 * official source links for the band.
 *
 * Content alignment only: nothing here decides formatting, spacing or layout.
 */

import type { CurriculumUnit, LevelCurriculum, SourceLink, SubjectCurriculum } from './types';
import { NATIONAL_SOURCES } from './types';
import { BIOLOGY } from './biology';
import { CHEMISTRY } from './chemistry';
import { PHYSICS } from './physics';
import { MATHEMATICS } from './mathematics';
import { ENGLISH } from './english';
import { ENTREPRENEURSHIP } from './entrepreneurship';

export type { CurriculumUnit, LevelCurriculum, SourceLink, SubjectCurriculum };
export { NATIONAL_SOURCES };

/** Keyed by the subject ids used in SUBJECTS (src/lib/examBank.ts). */
export const CURRICULUM: Record<string, SubjectCurriculum> = {
  biology: BIOLOGY,
  chemistry: CHEMISTRY,
  physics: PHYSICS,
  mathematics: MATHEMATICS,
  english: ENGLISH,
  entrepreneurship: ENTREPRENEURSHIP,
};

/** O-Level = S1–S3, A-Level = S4–S6. */
export function bandOf(level: string): 'O' | 'A' {
  return ['S4', 'S5', 'S6'].includes(level) ? 'A' : 'O';
}

export function subjectCurriculum(subjectId: string): SubjectCurriculum | undefined {
  return CURRICULUM[subjectId];
}

export function levelCurriculum(subjectId: string, level: string): LevelCurriculum | undefined {
  return CURRICULUM[subjectId]?.levels[level];
}

/** Detailed units (title + term + sub-topics) for a subject and level. */
export function unitsDetailed(subjectId: string, level: string): CurriculumUnit[] {
  return levelCurriculum(subjectId, level)?.units ?? [];
}

/** Unit titles only — what the teacher selects as coverage on the form. */
export function unitTitles(subjectId: string, level: string): string[] {
  return unitsDetailed(subjectId, level).map((u) => u.title);
}

/** Units restricted to the teacher's selection (all units when none picked). */
export function selectedUnits(
  subjectId: string,
  level: string,
  selected?: string[],
): CurriculumUnit[] {
  const all = unitsDetailed(subjectId, level);
  if (!selected?.length) return all;
  const picked = all.filter((u) => selected.includes(u.title));
  return picked.length ? picked : all;
}

/**
 * One line per unit, unit title plus its syllabus sub-topics. This is exactly
 * what the question writer is allowed to examine — nothing outside it.
 */
export function syllabusLines(
  subjectId: string,
  level: string,
  selected?: string[],
): string[] {
  return selectedUnits(subjectId, level, selected).map(
    (u) => `${u.title} (Term ${u.term}) — sub-topics: ${u.topics.join(', ')}`,
  );
}

/** Units taught in a given term, for term-based papers. */
export function unitsForTerm(subjectId: string, level: string, term: 1 | 2 | 3): CurriculumUnit[] {
  return unitsDetailed(subjectId, level).filter((u) => u.term === term);
}

/** Official, verified references for this subject at this level, plus national ones. */
export function sourcesFor(subjectId: string, level: string): SourceLink[] {
  const subject = CURRICULUM[subjectId];
  const band = bandOf(level);
  const links = subject ? subject.sources[band] : [];
  const seen = new Set<string>();
  return [...links, ...NATIONAL_SOURCES].filter((l) => {
    if (seen.has(l.url)) return false;
    seen.add(l.url);
    return true;
  });
}
