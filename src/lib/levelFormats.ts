/**
 * LEVEL-AWARE PAPER FORMATS
 *
 * A NESA paper does not look the same at every level. Primary (PLE), Ordinary
 * Level (S1-S3) and Advanced Level (S4-S6) each have their own paper
 * architecture: how many sections, what they contain, how long the paper runs,
 * whether candidates choose questions, and how deep the sub-part hierarchy goes.
 *
 * GOLDEN RULE: all of this is FIXED CODE, never an AI decision. The AI is only
 * told which conventions apply so the CONTENT it writes fits the paper the code
 * has already laid out.
 */
import type { BankType } from './examBank';
import type { SectionSpec } from './examBuilder';
import { getBlueprint, type NesaBlueprint } from '../data/nesaBlueprints';

export type LevelBand = 'primary' | 'olevel' | 'alevel';

export const LEVEL_OPTIONS: { value: string; label: string; band: LevelBand }[] = [
  { value: 'P4', label: 'P4 — Primary', band: 'primary' },
  { value: 'P5', label: 'P5 — Primary', band: 'primary' },
  { value: 'P6', label: 'P6 — Primary (PLE)', band: 'primary' },
  { value: 'S1', label: 'S1 — Ordinary Level', band: 'olevel' },
  { value: 'S2', label: 'S2 — Ordinary Level', band: 'olevel' },
  { value: 'S3', label: 'S3 — Ordinary Level (O-Level national)', band: 'olevel' },
  { value: 'S4', label: 'S4 — Advanced Level', band: 'alevel' },
  { value: 'S5', label: 'S5 — Advanced Level', band: 'alevel' },
  { value: 'S6', label: 'S6 — Advanced Level (A-Level national)', band: 'alevel' },
];

export function levelBand(level: string): LevelBand {
  const l = (level || '').toUpperCase().trim();
  if (l.startsWith('P')) return 'primary';
  if (['S1', 'S2', 'S3'].includes(l)) return 'olevel';
  return 'alevel';
}

export const BAND_LABEL: Record<LevelBand, string> = {
  primary: 'Primary (REB primary curriculum, PLE house style)',
  olevel: 'Ordinary Level (REB CBC O-Level, NESA O-Level national house style)',
  alevel: 'Advanced Level (REB CBC A-Level, NESA A-Level national house style)',
};

/** Paper length is a property of the level band, not of the AI. */
export const BAND_DURATION: Record<LevelBand, string> = {
  primary: '2 hours',
  olevel: '2 hours 30 minutes',
  alevel: '3 hours',
};

/** Total marks a paper of this band always carries. */
export const BAND_TOTAL_MARKS: Record<LevelBand, number> = {
  primary: 100,
  olevel: 100,
  alevel: 100,
};

/**
 * How papers of each band are conventionally laid out. These sentences are fed
 * to the model as grounding so the CONTENT matches the level; the model still
 * never decides layout.
 */
export const BAND_CONVENTIONS: Record<LevelBand, string[]> = {
  primary: [
    'Primary papers are short-item papers: mostly one-mark objective items, fill-in-the-blank and one-sentence answers.',
    'Language is simple and concrete; every item is answerable from the primary syllabus with no abstract theory.',
    'No multi-level sub-parts beyond (a), (b), (c); never use (i), (ii) at this level.',
    'Extended writing is at most one short guided composition or paragraph.',
  ],
  olevel: [
    'O-Level papers are three-part papers: an objective section, a short-answer / structured section, and a small extended-response section.',
    'Section A items are one mark each and test recall and basic comprehension.',
    'Structured questions use parts (a), (b), (c) and may use (i), (ii) one level deeper.',
    'Every question in the paper is compulsory unless the section header says otherwise.',
    'Calculations and explanations must be answerable in the space a 2-3 mark answer allows.',
  ],
  alevel: [
    'A-Level papers are choice papers: a compulsory structured section plus a section where candidates answer a stated number of questions out of several.',
    'Items are analytical: candidates must apply, analyse, evaluate and justify, not recall.',
    'Structured questions carry 10-20 marks and always break into parts (a), (b), (c) with (i), (ii) sub-parts where the reasoning has stages.',
    'Extended responses require a structured argument with introduction, developed body and conclusion.',
    'Data, case material or a scenario is stated inside the question itself, never assumed.',
  ],
};

/** Blueprint lookup that understands class levels (S1..S6, P4..P6). */
export function blueprintFor(subjectName: string, level: string): NesaBlueprint | null {
  return getBlueprint(subjectName, levelBand(level));
}

/** Map blueprint question-type vocabulary onto the types this app can render. */
const TYPE_MAP: Record<string, BankType> = {
  mcq: 'mcq',
  multiple_choice: 'mcq',
  true_false: 'true_false',
  matching: 'matching',
  fill_blank: 'fill_blank',
  completion: 'fill_blank',
  cloze_test: 'fill_blank',
  one_word: 'fill_blank',
  short: 'short_answer',
  short_answer: 'short_answer',
  calculation: 'short_answer',
  definition: 'short_answer',
  diagram: 'short_answer',
  diagram_labeling: 'short_answer',
  table: 'short_answer',
  transformation: 'short_answer',
  error_correction: 'short_answer',
  summary: 'short_answer',
  structured: 'structured',
  problem_solving: 'structured',
  case_study: 'structured',
  comprehension: 'structured',
  open_ended: 'structured',
  restricted_response: 'structured',
  essay: 'essay',
  composition: 'essay',
  letter: 'essay',
  report: 'essay',
  speech: 'essay',
  extended_response: 'essay',
};

function mapTypes(list: string[]): BankType[] {
  const out: BankType[] = [];
  list.forEach((raw) => {
    const t = TYPE_MAP[String(raw).toLowerCase().replace(/[\s-]+/g, '_')];
    if (t && !out.includes(t)) out.push(t);
  });
  return out;
}

/** Fallback architecture per band when no subject blueprint exists. */
const BAND_PLAN: Record<LevelBand, SectionSpec[]> = {
  primary: [
    {
      id: 'sec_1',
      name: 'SECTION A: OBJECTIVE QUESTIONS',
      marks: 40,
      types: ['mcq', 'true_false', 'fill_blank', 'matching'],
    },
    {
      id: 'sec_2',
      name: 'SECTION B: SHORT ANSWER QUESTIONS',
      marks: 45,
      types: ['short_answer'],
    },
    { id: 'sec_3', name: 'SECTION C: GUIDED WRITING', marks: 15, types: ['essay'] },
  ],
  olevel: [
    {
      id: 'sec_1',
      name: 'SECTION A: OBJECTIVE QUESTIONS',
      marks: 30,
      types: ['mcq', 'true_false', 'matching', 'fill_blank'],
    },
    {
      id: 'sec_2',
      name: 'SECTION B: SHORT ANSWER AND STRUCTURED QUESTIONS',
      marks: 45,
      types: ['short_answer', 'structured'],
    },
    { id: 'sec_3', name: 'SECTION C: EXTENDED RESPONSE', marks: 25, types: ['essay'] },
  ],
  alevel: [
    {
      id: 'sec_1',
      name: 'SECTION A: COMPULSORY STRUCTURED QUESTIONS',
      marks: 55,
      types: ['structured', 'short_answer'],
    },
    {
      id: 'sec_2',
      name: 'SECTION B: EXTENDED RESPONSE AND ANALYSIS',
      marks: 45,
      types: ['essay'],
    },
  ],
};

export interface FormatProfile {
  band: LevelBand;
  bandLabel: string;
  duration: string;
  totalMarks: number;
  sections: SectionSpec[];
  /** Level + subject conventions, fed to the AI as grounding. */
  conventions: string[];
  /** Where the architecture came from, shown to the teacher. */
  sourceLabel: string;
}

/**
 * The official paper architecture for a subject at a level: sections, their
 * marks, the question types each may contain, and the paper's length.
 *
 * Order of authority:
 *   1. the subject's own examination architecture (examArchitecture.ts)
 *   2. the NESA blueprint for the subject
 *   3. the generic band plan
 */
export function formatProfileFor(subjectName: string, level: string): FormatProfile {
  const band = levelBand(level);
  const arch = architectureFor(subjectName, band);

  if (arch) {
    return {
      band,
      bandLabel: BAND_LABEL[band],
      duration: arch.duration,
      totalMarks: arch.totalMarks,
      sections: arch.sections.map((s) => ({
        id: s.id,
        name: s.name,
        marks: s.marks,
        types: [...s.types],
      })),
      conventions: [
        ...arch.sections.map(
          (s) =>
            `${s.name} — ${s.marks} marks, about ${s.minutes} minutes, ${COGNITIVE_LABEL[s.cognitive]}, answers of ${ANSWER_LENGTH_LABEL[s.answerLength]}. ${s.purpose}`,
        ),
        ...BAND_CONVENTIONS[band],
      ],
      sourceLabel: arch.label,
    };
  }

  const bp = blueprintFor(subjectName, level);

  let sections: SectionSpec[] = BAND_PLAN[band].map((s) => ({ ...s }));
  let sourceLabel = `NESA ${band === 'primary' ? 'Primary' : band === 'olevel' ? 'O-Level' : 'A-Level'} standard architecture`;
  const conventions = [...BAND_CONVENTIONS[band]];

  if (bp) {
    const mapped = bp.sections
      .map((s, i) => ({
        id: `sec_${i + 1}`,
        name: s.title.toUpperCase(),
        marks: s.totalMarks,
        types: mapTypes(s.allowedQuestionTypes),
        instructions: s.instructions,
      }))
      .filter((s) => s.types.length > 0 && s.marks > 0);

    if (mapped.length) {
      sections = mapped;
      sourceLabel = `NESA blueprint — ${bp.subject} ${bp.level}`;
      if (bp.globalRules) conventions.push(bp.globalRules);
      bp.sections.forEach((s) => {
        if (s.structuralRules) conventions.push(`${s.title}: ${s.structuralRules}`);
        else if (s.purpose) conventions.push(`${s.title}: ${s.purpose}`);
      });
    }
  }

  return {
    band,
    bandLabel: BAND_LABEL[band],
    duration: BAND_DURATION[band],
    totalMarks: sections.reduce((sum, s) => sum + s.marks, 0) || BAND_TOTAL_MARKS[band],
    sections,
    conventions,
    sourceLabel,
  };
}

