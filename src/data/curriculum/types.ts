/**
 * CURRICULUM MAP — shared types.
 *
 * Content/curriculum alignment only. Nothing in here influences formatting,
 * spacing or layout: those stay fixed rules in the engines and print CSS.
 */

export type Term = 1 | 2 | 3;

/** One syllabus unit with the term it is normally taught in and its topics. */
export interface CurriculumUnit {
  title: string;
  /** Term the REB content distribution normally places this unit in. */
  term: Term;
  /** Sub-topics inside the unit — the finest grain a teacher can assess. */
  topics: string[];
}

export interface LevelCurriculum {
  competences: string[];
  units: CurriculumUnit[];
}

/** A verified, reachable official reference for the subject. */
export interface SourceLink {
  label: string;
  url: string;
  kind: 'syllabus' | 'course' | 'portal' | 'exams';
}

export interface SubjectCurriculum {
  /** Keyed by level: S1..S6. */
  levels: Record<string, LevelCurriculum>;
  /** Official links per band: O-level (S1-S3) and A-level (S4-S6). */
  sources: { O: SourceLink[]; A: SourceLink[] };
}

/** Links that apply to every subject and level. */
export const NATIONAL_SOURCES: SourceLink[] = [
  { label: 'REB e-learning: secondary syllabi', url: 'https://elearning.reb.rw/course/section.php?id=5866', kind: 'portal' },
  { label: 'NESA — national examinations authority', url: 'https://www.nesa.gov.rw/', kind: 'exams' },
  { label: 'MINEDUC — Ministry of Education', url: 'https://www.mineduc.gov.rw/', kind: 'portal' },
];
