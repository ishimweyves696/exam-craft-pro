/**
 * SUBJECT EXAMINATION ARCHITECTURE
 *
 * Before a single question is written, the system already knows how a paper of
 * this subject, at this level, is built at NESA: which sections exist, in which
 * ORDER, which question types each section may legally contain, how long an
 * answer is expected to be, what cognitive demand it carries, how many marks it
 * is worth and roughly how many minutes a candidate should spend on it.
 *
 * GOLDEN RULE: this is fixed code, never an AI decision. The teacher may rename
 * a section, change its marks and pick among the ALLOWED types — but a type
 * that does not belong in that section of that subject's paper can never be
 * selected, and any generated item of a disallowed type is rejected downstream.
 */
import type { BankType } from './examBank';
import type { LevelBand } from './levelFormats';

/** Expected length of a candidate's answer — drives cognitive framing, not layout. */
export type AnswerLength = 'one-word' | 'short' | 'paragraph' | 'extended';

/** Dominant cognitive demand of a section. */
export type CognitiveDemand = 'recall' | 'comprehension' | 'application' | 'analysis';

export interface SectionRule {
  id: string;
  name: string;
  marks: number;
  /** Suggested minutes a candidate spends in this section. */
  minutes: number;
  /** Types selected by default for this section. */
  types: BankType[];
  /** Every type that may legally appear in this section of this subject's paper. */
  allowed: BankType[];
  answerLength: AnswerLength;
  cognitive: CognitiveDemand;
  /** What the section exists to test — fed to the writer as content grounding. */
  purpose: string;
}

export interface SubjectArchitecture {
  label: string;
  duration: string;
  totalMarks: number;
  /** Ordered: section order is part of the subject's examination standard. */
  sections: SectionRule[];
}

const OBJECTIVE: BankType[] = ['mcq', 'true_false', 'fill_blank', 'matching'];

/* ---------- science papers (Biology, Chemistry, Physics) ---------- */

const scienceOLevel = (subject: string): SubjectArchitecture => ({
  label: `NESA O-Level ${subject} paper structure`,
  duration: '2 hours 30 minutes',
  totalMarks: 100,
  sections: [
    {
      id: 'sec_1',
      name: 'SECTION A: OBJECTIVE QUESTIONS',
      marks: 30,
      minutes: 35,
      types: OBJECTIVE,
      allowed: OBJECTIVE,
      answerLength: 'one-word',
      cognitive: 'recall',
      purpose: 'Tests recall of facts, terms, definitions and basic comprehension of the syllabus units.',
    },
    {
      id: 'sec_2',
      name: 'SECTION B: SHORT ANSWER AND STRUCTURED QUESTIONS',
      marks: 45,
      minutes: 70,
      types: ['short_answer', 'structured'],
      allowed: ['short_answer', 'structured'],
      answerLength: 'short',
      cognitive: 'application',
      purpose:
        'Tests explanation, description, calculation and application of concepts to familiar situations.',
    },
    {
      id: 'sec_3',
      name: 'SECTION C: EXTENDED RESPONSE',
      marks: 25,
      minutes: 45,
      types: ['essay'],
      allowed: ['essay', 'structured'],
      answerLength: 'extended',
      cognitive: 'analysis',
      purpose:
        'Tests sustained scientific reasoning: analysis, evaluation and justified conclusions in continuous prose.',
    },
  ],
});

const scienceALevel = (subject: string): SubjectArchitecture => ({
  label: `NESA A-Level ${subject} paper structure`,
  duration: '3 hours',
  totalMarks: 100,
  sections: [
    {
      id: 'sec_1',
      name: 'SECTION A: COMPULSORY STRUCTURED QUESTIONS',
      marks: 55,
      minutes: 100,
      types: ['structured', 'short_answer'],
      allowed: ['structured', 'short_answer'],
      answerLength: 'paragraph',
      cognitive: 'application',
      purpose:
        'Multi-stage structured problems built on data, experiments or scenarios stated in the question.',
    },
    {
      id: 'sec_2',
      name: 'SECTION B: EXTENDED RESPONSE AND ANALYSIS',
      marks: 45,
      minutes: 80,
      types: ['essay'],
      allowed: ['essay', 'structured'],
      answerLength: 'extended',
      cognitive: 'analysis',
      purpose:
        'Higher-order essays requiring analysis, synthesis and evaluation of advanced scientific content.',
    },
  ],
});

/* ---------- Mathematics ---------- */

const MATHEMATICS: Partial<Record<LevelBand, SubjectArchitecture>> = {
  olevel: {
    label: 'NESA O-Level Mathematics paper structure',
    duration: '2 hours 30 minutes',
    totalMarks: 100,
    sections: [
      {
        id: 'sec_1',
        name: 'SECTION A: SHORT COMPUTATIONAL QUESTIONS',
        marks: 40,
        minutes: 60,
        types: ['mcq', 'short_answer'],
        allowed: ['mcq', 'short_answer', 'fill_blank', 'true_false'],
        answerLength: 'short',
        cognitive: 'application',
        purpose:
          'Objective and short computational items: multiple-choice and single- or two-step calculations covering the breadth of the syllabus, with working shown where marks are given for it.',
      },
      {
        id: 'sec_2',
        name: 'SECTION B: EXTENDED STRUCTURED PROBLEMS',
        marks: 60,
        minutes: 90,
        types: ['structured'],
        allowed: ['structured', 'short_answer'],
        answerLength: 'paragraph',
        cognitive: 'analysis',
        purpose:
          'Multi-step problems in parts (a), (b), (c) where each part builds on the previous working.',
      },
    ],
  },
  alevel: {
    label: 'NESA A-Level Mathematics paper structure',
    duration: '3 hours',
    totalMarks: 100,
    sections: [
      {
        id: 'sec_1',
        name: 'SECTION A: COMPULSORY SHORT QUESTIONS',
        marks: 55,
        minutes: 95,
        types: ['short_answer'],
        allowed: ['short_answer', 'structured', 'mcq'],
        answerLength: 'short',
        cognitive: 'application',
        purpose: 'Compulsory computations covering the breadth of the syllabus units.',
      },
      {
        id: 'sec_2',
        name: 'SECTION B: EXTENDED MULTI-STEP PROBLEMS',
        marks: 45,
        minutes: 85,
        types: ['structured'],
        allowed: ['structured'],
        answerLength: 'extended',
        cognitive: 'analysis',
        purpose:
          'Long problems requiring proof, modelling or multi-stage reasoning with complete justification.',
      },
    ],
  },
};

/* ---------- English (fixed progression) ---------- */

const ENGLISH: Partial<Record<LevelBand, SubjectArchitecture>> = {
  olevel: {
    label: 'NESA O-Level English paper structure',
    duration: '2 hours 30 minutes',
    totalMarks: 100,
    sections: [
      {
        id: 'sec_1',
        name: 'SECTION A: COMPREHENSION',
        marks: 25,
        minutes: 40,
        types: ['structured'],
        allowed: ['structured', 'short_answer'],
        answerLength: 'short',
        cognitive: 'comprehension',
        purpose:
          'Questions on a passage stated in full inside the question, testing literal and inferential understanding.',
      },
      {
        id: 'sec_2',
        name: 'SECTION B: VOCABULARY AND LANGUAGE USE',
        marks: 25,
        minutes: 35,
        types: ['fill_blank', 'short_answer'],
        allowed: ['fill_blank', 'short_answer', 'mcq', 'matching'],
        answerLength: 'one-word',
        cognitive: 'application',
        purpose: 'Word meaning, grammar, sentence transformation and correct usage.',
      },
      {
        id: 'sec_3',
        name: 'SECTION C: SUMMARY WRITING',
        marks: 15,
        minutes: 25,
        types: ['short_answer'],
        allowed: ['short_answer', 'structured'],
        answerLength: 'paragraph',
        cognitive: 'analysis',
        purpose: 'Condensing a stated passage into a set number of points in the candidate’s own words.',
      },
      {
        id: 'sec_4',
        name: 'SECTION D: COMPOSITION',
        marks: 35,
        minutes: 50,
        types: ['essay'],
        allowed: ['essay'],
        answerLength: 'extended',
        cognitive: 'analysis',
        purpose:
          'One extended composition (narrative, argumentative, letter, report or speech) with a stated audience and purpose.',
      },
    ],
  },
  alevel: {
    label: 'NESA A-Level English paper structure',
    duration: '3 hours',
    totalMarks: 100,
    sections: [
      {
        id: 'sec_1',
        name: 'SECTION A: COMPREHENSION AND VOCABULARY',
        marks: 30,
        minutes: 55,
        types: ['structured'],
        allowed: ['structured', 'short_answer'],
        answerLength: 'paragraph',
        cognitive: 'analysis',
        purpose: 'Close reading of a demanding passage: inference, tone, purpose and word meaning in context.',
      },
      {
        id: 'sec_2',
        name: 'SECTION B: LANGUAGE USE',
        marks: 25,
        minutes: 40,
        types: ['short_answer', 'fill_blank'],
        allowed: ['short_answer', 'fill_blank'],
        answerLength: 'short',
        cognitive: 'application',
        purpose: 'Register, transformation, cohesion and precise grammatical control.',
      },
      {
        id: 'sec_3',
        name: 'SECTION C: COMPOSITION WRITING',
        marks: 45,
        minutes: 85,
        types: ['essay'],
        allowed: ['essay'],
        answerLength: 'extended',
        cognitive: 'analysis',
        purpose: 'Sustained argumentative or discursive writing with a defended position.',
      },
    ],
  },
};

/* ---------- Entrepreneurship ---------- */

const ENTREPRENEURSHIP: Partial<Record<LevelBand, SubjectArchitecture>> = {
  olevel: {
    label: 'NESA O-Level Entrepreneurship paper structure',
    duration: '2 hours 30 minutes',
    totalMarks: 100,
    sections: [
      {
        id: 'sec_1',
        name: 'SECTION A: OBJECTIVE QUESTIONS',
        marks: 20,
        minutes: 25,
        types: OBJECTIVE,
        allowed: OBJECTIVE,
        answerLength: 'one-word',
        cognitive: 'recall',
        purpose: 'Business terms, definitions and basic principles of enterprise.',
      },
      {
        id: 'sec_2',
        name: 'SECTION B: SHORT ANSWER AND APPLICATION QUESTIONS',
        marks: 40,
        minutes: 60,
        types: ['short_answer', 'structured'],
        allowed: ['short_answer', 'structured'],
        answerLength: 'short',
        cognitive: 'application',
        purpose: 'Applying business concepts to small Rwandan enterprises and everyday trading situations.',
      },
      {
        id: 'sec_3',
        name: 'SECTION C: CASE STUDY AND EXTENDED RESPONSE',
        marks: 40,
        minutes: 65,
        types: ['structured', 'essay'],
        allowed: ['structured', 'essay'],
        answerLength: 'extended',
        cognitive: 'analysis',
        purpose:
          'A business scenario stated in the question, requiring analysis, costing or strategy and a justified recommendation.',
      },
    ],
  },
  alevel: {
    label: 'NESA A-Level Entrepreneurship paper structure',
    duration: '3 hours',
    totalMarks: 100,
    sections: [
      {
        id: 'sec_1',
        name: 'SECTION A: COMPULSORY SHORT AND STRUCTURED QUESTIONS',
        marks: 40,
        minutes: 65,
        types: ['short_answer', 'structured'],
        allowed: ['short_answer', 'structured'],
        answerLength: 'short',
        cognitive: 'application',
        purpose: 'Core enterprise, accounting and management content applied to stated business facts.',
      },
      {
        id: 'sec_2',
        name: 'SECTION B: CASE STUDY ANALYSIS',
        marks: 30,
        minutes: 55,
        types: ['structured'],
        allowed: ['structured'],
        answerLength: 'paragraph',
        cognitive: 'analysis',
        purpose: 'A full business case stated in the question, analysed in staged parts (a), (b), (c).',
      },
      {
        id: 'sec_3',
        name: 'SECTION C: EXTENDED RESPONSE',
        marks: 30,
        minutes: 60,
        types: ['essay'],
        allowed: ['essay'],
        answerLength: 'extended',
        cognitive: 'analysis',
        purpose: 'Evaluative essays on enterprise strategy, ethics, finance and the Rwandan business environment.',
      },
    ],
  },
};

/** Keyed by normalised subject name. */
const ARCHITECTURE: Record<string, Partial<Record<LevelBand, SubjectArchitecture>>> = {
  biology: { olevel: scienceOLevel('Biology'), alevel: scienceALevel('Biology') },
  chemistry: { olevel: scienceOLevel('Chemistry'), alevel: scienceALevel('Chemistry') },
  physics: { olevel: scienceOLevel('Physics'), alevel: scienceALevel('Physics') },
  mathematics: MATHEMATICS,
  english: ENGLISH,
  entrepreneurship: ENTREPRENEURSHIP,
};

function key(subjectName: string): string {
  const n = (subjectName || '').toLowerCase();
  if (n.includes('biolog')) return 'biology';
  if (n.includes('chemis')) return 'chemistry';
  if (n.includes('physic')) return 'physics';
  if (n.includes('math')) return 'mathematics';
  if (n.includes('english')) return 'english';
  if (n.includes('entrepren')) return 'entrepreneurship';
  return n.trim();
}

/** The official architecture for this subject at this band, when one is defined. */
export function architectureFor(
  subjectName: string,
  band: LevelBand,
): SubjectArchitecture | undefined {
  return ARCHITECTURE[key(subjectName)]?.[band];
}

/** The rule governing one section of the paper, matched by id then by position. */
export function sectionRuleFor(
  subjectName: string,
  band: LevelBand,
  sectionId: string,
  index: number,
): SectionRule | undefined {
  const arch = architectureFor(subjectName, band);
  if (!arch) return undefined;
  return arch.sections.find((s) => s.id === sectionId) ?? arch.sections[index];
}

export const ANSWER_LENGTH_LABEL: Record<AnswerLength, string> = {
  'one-word': 'one word or one line',
  short: 'two to four sentences',
  paragraph: 'a developed paragraph per part',
  extended: 'a full multi-paragraph response',
};

export const COGNITIVE_LABEL: Record<CognitiveDemand, string> = {
  recall: 'recall',
  comprehension: 'comprehension',
  application: 'application',
  analysis: 'analysis and evaluation',
};
