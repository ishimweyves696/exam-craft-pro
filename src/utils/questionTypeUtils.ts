import { recommendedTypesFor, CATEGORY_QUESTION_TYPES, SubjectCategory, SUBJECT_CATEGORIES } from '../constants';

/**
 * Objective / Recall / Low-Mark Item Types (Typically 1-3 marks)
 */
const OBJECTIVE_TYPES = [
  'mcq',
  'true_false',
  'matching',
  'fill_blank',
  'short_answer',
  'one_word',
  'completion'
];

/**
 * Structured / Application / Medium-Mark Item Types (Typically 3-8 marks)
 */
const STRUCTURED_TYPES = [
  'short_answer',
  'calculation',
  'transformation',
  'table',
  'diagram',
  'diagram_labeling',
  'sentence_rewriting',
  'reorder',
  'cloze_test',
  'error_correction',
  'summary'
];

/**
 * Extended Response / High-Mark Item Types (Typically 8+ marks)
 */
const EXTENDED_TYPES = [
  'essay',
  'composition',
  'summary',
  'case_study',
  'open_ended',
  'report',
  'letter',
  'speech'
];

/**
 * Fisher-Yates shuffle helper
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates a randomized, pedagogically sound set of question types for an exam section
 * based on the subject category, section position, and mark distribution.
 */
export function getRandomQuestionTypesForSection(
  subjectName: string,
  sectionIndex: number,
  totalSections: number = 2,
  marksPerQuestion: number = 3,
  sectionMarks: number = 40
): string[] {
  const recommended = recommendedTypesFor(subjectName);
  if (!recommended || recommended.length === 0) {
    return ['short_answer', 'mcq'];
  }

  // Determine section tier (early = objective, middle = structured, late = extended)
  const isEarlySection = sectionIndex === 0 && (totalSections > 1 || marksPerQuestion <= 3);
  const isLateSection = (sectionIndex === totalSections - 1 && totalSections > 1) || marksPerQuestion >= 9 || sectionMarks >= 40;
  const isMidSection = !isEarlySection && !isLateSection;

  let candidatePool: string[] = [];

  if (isEarlySection) {
    // Prefer objective + short answer
    const objectiveMatches = recommended.filter(t => OBJECTIVE_TYPES.includes(t));
    candidatePool = objectiveMatches.length > 0 ? objectiveMatches : recommended;
  } else if (isLateSection) {
    // Prefer extended + structured
    const extendedMatches = recommended.filter(t => EXTENDED_TYPES.includes(t) || STRUCTURED_TYPES.includes(t));
    candidatePool = extendedMatches.length > 0 ? extendedMatches : recommended;
  } else {
    // Middle section: structured + calculation/application
    const structuredMatches = recommended.filter(t => STRUCTURED_TYPES.includes(t));
    candidatePool = structuredMatches.length > 0 ? structuredMatches : recommended;
  }

  // Fallback to all recommended if pool is too small
  if (candidatePool.length === 0) {
    candidatePool = recommended;
  }

  // Shuffle and pick 2 to 4 diverse question types
  const countToPick = Math.min(
    candidatePool.length,
    Math.max(2, Math.min(4, Math.floor(candidatePool.length * 0.7) + 1))
  );

  const selected = shuffle(candidatePool).slice(0, countToPick);
  return selected.length > 0 ? selected : [recommended[0]];
}

/**
 * Generates randomized question types across all sections of an exam configuration.
 */
export function randomizeAllSectionQuestionTypes(
  subjectName: string,
  sections: Array<{ marks: number; numberOfQuestions: number; questionTypes: string[] }>
): string[][] {
  return sections.map((sec, idx) => {
    const avgMarks = Math.round(Number(sec.marks) / (Number(sec.numberOfQuestions) || 1));
    return getRandomQuestionTypesForSection(subjectName, idx, sections.length, avgMarks, Number(sec.marks));
  });
}
