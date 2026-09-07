/**
 * DETERMINISTIC EXAM BUILDER
 *
 * GOLDEN RULE: content comes from the bank (later: AI). Every formatting,
 * layout, spacing, numbering and mark-allocation decision is a fixed rule
 * in this file or in the engines / print CSS. Nothing here is random:
 * the same config always produces a byte-identical exam.
 */
import {
  GeneratedExam,
  GeneratedMarkingGuide,
  Question,
  Section,
  Answer,
} from '../types';
import { BankItem, BankType, getSubject } from './examBank';
import { buildCanonicalExamStructure } from '../backend/engine/numberingLayoutEngine';
import { makeRng, seededShuffle } from './rng';
import type { SourceSelectionRef } from './source/types';

export type SectionKind = 'objective' | 'short' | 'essay';

export type ContentSource = 'bank' | 'ai';

/**
 * Teacher-authored section. The teacher owns the name, the mark allocation and
 * the question types; the app still owns every formatting, numbering and
 * answer-space decision inside the section.
 */
export interface SectionSpec {
  id: string;
  name: string;
  marks: number;
  types: BankType[];
  instructions?: string;
  /**
   * Source-book units/subunits pinned to this section. Content selection only:
   * the AI must draw this section's items from these parts of the book.
   */
  sourceNodeIds?: string[];
}


export interface ExamBuildConfig {
  subjectId: string;
  level: string;
  academicYear: string;
  term: string;
  duration: string;
  totalMarks: number;
  sections: SectionKind[];
  /** Teacher-authored sections. Authoritative when present. */
  sectionPlan?: SectionSpec[];
  examDate: string;
  examTime: string;
  /**
   * Seeded variant. The seed drives CONTENT SELECTION only — never marks,
   * section weights, numbering or layout. Same seed => same paper.
   */
  seed: number;
  /** Where question content comes from. Formatting is code-owned either way. */
  source: ContentSource;
  /**
   * REB/CBC curriculum units the paper must examine. Empty = whole syllabus
   * for the level. Content selection only — never layout.
   */
  units?: string[];
  /** Cognitive (Bloom) emphasis requested by the teacher. */
  cognitive?: CognitiveEmphasis;
  /**
   * Uploaded book the paper is drawn from. Only the reference travels in the
   * exam id; the excerpts themselves stay in the teacher's browser and are
   * sent with the generation request.
   */
  sourceMaterial?: SourceSelectionRef;
}

export type CognitiveEmphasis = 'balanced' | 'application' | 'analysis';

export const DEFAULT_SECTION_PLAN: SectionSpec[] = [
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
  {
    id: 'sec_3',
    name: 'SECTION C: EXTENDED RESPONSE',
    marks: 25,
    types: ['essay'],
  },
];

export const DEFAULT_CONFIG: ExamBuildConfig = {
  subjectId: 'biology',
  level: 'S4',
  academicYear: '2025-2026',
  term: 'TERM 1',
  duration: '3 hours',
  totalMarks: 100,
  sections: ['objective', 'short', 'essay'],
  sectionPlan: DEFAULT_SECTION_PLAN,
  examDate: '',
  examTime: '',
  seed: 1,
  source: 'ai',
  units: [],
  cognitive: 'balanced',
};

/** All question types a teacher can put in a section, with friendly labels. */
export const QUESTION_TYPE_OPTIONS: { type: BankType; label: string; marks: string }[] = [
  { type: 'mcq', label: 'Multiple choice', marks: '1 mark each' },
  { type: 'true_false', label: 'True / false', marks: '1 mark each' },
  { type: 'fill_blank', label: 'Fill in the blank', marks: '1 mark each' },
  { type: 'matching', label: 'Matching', marks: '~5 marks each' },
  { type: 'short_answer', label: 'Short answer', marks: '5 marks each' },
  { type: 'structured', label: 'Structured (a)(b)(c)', marks: '~10 marks each' },
  { type: 'essay', label: 'Essay / extended response', marks: '15 marks each' },
];

/** Instructions are derived from the question types the section contains. */
export function instructionsForTypes(types: BankType[]): string {
  if (types.length === 1 && types[0] === 'essay')
    return 'Answer ALL questions in this section. Write in clear, well-structured paragraphs.';
  if (types.some((t) => t === 'structured' || t === 'short_answer'))
    return 'Answer ALL questions in this section. Show all your working where required.';
  return 'Answer ALL questions in this section.';
}

/** Total marks implied by the teacher's section plan. */
export function planTotalMarks(plan: SectionSpec[]): number {
  return plan.reduce((sum, s) => sum + (Number(s.marks) || 0), 0);
}

/** Sections the teacher configured, falling back to the standard NESA layout. */
export function resolveSectionPlan(config: ExamBuildConfig): SectionSpec[] {
  const plan = (config.sectionPlan ?? []).filter((s) => s.types.length > 0 && s.marks > 0);
  if (plan.length) return plan;
  const kinds = config.sections.length ? config.sections : DEFAULT_CONFIG.sections;
  const budgets = splitMarks(config.totalMarks, kinds);
  return kinds.map((kind, i) => ({
    id: `sec_${i + 1}`,
    name: SECTION_TITLES[kind],
    marks: budgets[i],
    types: SECTION_TYPES[kind],
  }));
}


/* ---------- FIXED RULES (never AI-decided) ---------- */

/** Marks a question of a given type is always worth. */
export const MARKS_BY_TYPE: Record<BankType, number> = {
  mcq: 1,
  true_false: 1,
  fill_blank: 1,
  matching: 5,
  short_answer: 5,
  structured: 6,
  essay: 15,
};

/** Answer space is a pure function of type + marks. */
function answerSpaceFor(type: BankType, marks: number): 'none' | 'small' | 'medium' | 'large' | 'xlarge' {
  if (type === 'mcq' || type === 'fill_blank' || type === 'matching') return 'none';
  if (type === 'true_false') return 'small';
  if (type === 'essay') return 'xlarge';
  if (marks <= 2) return 'small';
  if (marks <= 5) return 'medium';
  return 'large';
}

export const SECTION_TYPES: Record<SectionKind, BankType[]> = {
  objective: ['mcq', 'true_false', 'matching', 'fill_blank'],
  short: ['short_answer', 'structured'],
  essay: ['essay'],
};

const SECTION_TITLES: Record<SectionKind, string> = {
  objective: 'SECTION A: OBJECTIVE QUESTIONS',
  short: 'SECTION B: SHORT ANSWER AND STRUCTURED QUESTIONS',
  essay: 'SECTION C: EXTENDED RESPONSE',
};


/** Marks split across sections — fixed proportions, largest remainder to the last section. */
export const SECTION_WEIGHT: Record<SectionKind, number> = {
  objective: 0.3,
  short: 0.45,
  essay: 0.25,
};

export const EXAM_INSTRUCTIONS: string[] = [
  'Write your names and index number on the answer booklet as instructed.',
  'Do not open this question paper until you are told to do so.',
  'This paper consists of the sections indicated below. Answer as instructed in each section.',
  'Use a blue or black pen only. Diagrams may be drawn in pencil.',
  'Show all your working clearly where calculations are required.',
  'Do not write anything in the space reserved for the examiner.',
];

/* ---------- BUILD ---------- */

export function itemMarks(item: BankItem): number {
  if (item.type === 'matching' && item.pairs) return item.pairs.length;
  if (item.type === 'structured' && item.parts) {
    return item.parts.reduce((sum, p) => sum + (p.parts?.length ? p.parts.length * 2 : 3), 0);
  }
  return MARKS_BY_TYPE[item.type];
}

function toQuestion(
  item: BankItem,
  index: number,
  sectionId: string,
  markOverride?: number,
): Question {
  const id = `${sectionId}_q${index + 1}`;
  const marks = markOverride ?? itemMarks(item);
  const base = {
    id,
    number: index + 1,
    text: item.text,
    marks,
    topic: item.topic,
  };

  switch (item.type) {
    case 'mcq':
      return {
        ...base,
        type: 'mcq',
        answerSpace: 'none',
        options: (item.options ?? []).map((o, i) => ({
          id: `${id}_o${i + 1}`,
          text: o.text,
          isCorrect: !!o.isCorrect,
        })),
      };
    case 'true_false':
      return { ...base, type: 'true_false', answerSpace: 'none' };
    case 'fill_blank':
      return { ...base, type: 'fill_blank', answerSpace: 'none' };
    case 'matching': {
      const pairs = item.pairs ?? [];
      const rightPool = pairs
        .map((p) => p.right)
        .slice()
        .sort((a, b) => a.localeCompare(b));
      return {
        ...base,
        type: 'matching',
        answerSpace: 'none',
        tableData: {
          rows: [
            ['Column A', 'Column B'],
            ...pairs.map((p, i) => [p.left, rightPool[i] ?? '']),
          ],
        },
      };
    }
    case 'essay':
      return { ...base, type: 'essay', answerSpace: 'xlarge' };
    case 'structured': {
      const parts = item.parts ?? [];
      return {
        ...base,
        type: 'short_answer',
        answerSpace: 'none',
        subQuestions: parts.map((p, pi) => {
          const subId = `${id}_sub${pi + 1}`;
          const children = p.parts ?? [];
          const subMarks = children.length ? children.length * 2 : 3;
          if (children.length) {
            return {
              id: subId,
              number: pi + 1,
              text: p.text,
              marks: subMarks,
              type: 'short_answer' as const,
              answerSpace: 'none' as const,
              subQuestions: children.map((c, ci) => ({
                id: `${subId}_ssub${ci + 1}`,
                number: ci + 1,
                text: c.text,
                marks: 2,
                type: 'short_answer' as const,
                answerSpace: answerSpaceFor('short_answer', 2),
              })),
            };
          }
          return {
            id: subId,
            number: pi + 1,
            text: p.text,
            marks: subMarks,
            type: 'short_answer' as const,
            answerSpace: answerSpaceFor('short_answer', subMarks),
          };
        }),
      } as Question;
    }
    default:
      return {
        ...base,
        type: 'short_answer',
        answerSpace: answerSpaceFor('short_answer', marks),
      };
  }
}

function collectAnswers(item: BankItem, q: Question): Answer[] {
  const answers: Answer[] = [];
  if (item.type === 'matching' && item.pairs) {
    answers.push({
      questionId: q.id,
      number: q.number,
      expected: item.pairs.map((p) => `${p.left} → ${p.right}`).join('; '),
      marks: q.marks,
    });
    return answers;
  }
  if (item.type === 'structured' && item.parts) {
    const subs = (q as any).subQuestions ?? [];
    item.parts.forEach((p, pi) => {
      const sub = subs[pi];
      if (!sub) return;
      if (p.parts?.length) {
        p.parts.forEach((c, ci) => {
          const ssub = sub.subQuestions?.[ci];
          if (!ssub) return;
          answers.push({
            questionId: ssub.id,
            number: q.number,
            expected: c.answer ?? '',
            marks: ssub.marks,
          });
        });
      } else {
        answers.push({
          questionId: sub.id,
          number: q.number,
          expected: p.answer ?? '',
          marks: sub.marks,
        });
      }
    });
    return answers;
  }
  answers.push({
    questionId: q.id,
    number: q.number,
    expected: item.answer ?? (item.rubric ? item.rubric.join(' ') : ''),
    marks: q.marks,
    rubric: item.rubric,
  });
  return answers;
}

export function splitMarks(total: number, kinds: SectionKind[]): number[] {
  const weights = kinds.map((k) => SECTION_WEIGHT[k]);
  const sumW = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (total * w) / sumW);
  const floors = raw.map((r) => Math.floor(r));
  let remainder = total - floors.reduce((a, b) => a + b, 0);
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  for (const o of order) {
    if (remainder <= 0) break;
    floors[o.i] += 1;
    remainder -= 1;
  }
  return floors;
}

/** Split a mark total into n equal parts, extra marks going to the first parts. */
function splitEven(total: number, n: number): number[] {
  const base = Math.floor(total / n);
  const rest = total - base * n;
  return Array.from({ length: n }, (_, i) => base + (i < rest ? 1 : 0));
}


export function buildExam(
  config: ExamBuildConfig,
  /**
   * Optional AI-generated content pool. Content only — the items go through
   * exactly the same fixed rules as bank items, so nothing about the paper's
   * look, marks or numbering can change based on where the words came from.
   * The static bank is always appended behind it as a guaranteed fallback.
   */
  aiItems?: BankItem[],
): {
  exam: GeneratedExam;
  markingGuide: GeneratedMarkingGuide;
} {
  const subject = getSubject(config.subjectId);
  const plan = resolveSectionPlan(config);

  // Seeded variant: the seed reorders the CONTENT POOL and nothing else.
  const rng = makeRng(config.seed || 1);
  const bankPool = seededShuffle(subject.items, rng);
  const contentPool = aiItems?.length
    ? [...seededShuffle(aiItems, rng), ...bankPool]
    : bankPool;

  const sections: Section[] = [];
  const guideSections: GeneratedMarkingGuide['sections'] = [];
  const used = new Set<string>();

  plan.forEach((spec, si) => {
    const sectionId = `sec_${si + 1}`;
    // group by type in the order the teacher listed them so the paper always
    // presents the same type order for the same configuration.
    // Items generated for THIS section (from the book units pinned to it) come
    // first; anything unpinned, then the bank, fills what is left.
    const pool = spec.types.flatMap((t) => [
      ...contentPool.filter((it) => it.type === t && it.sectionId === spec.id),
      ...contentPool.filter((it) => it.type === t && !it.sectionId),
      ...contentPool.filter((it) => it.type === t && it.sectionId && it.sectionId !== spec.id),
    ]);
    const kind: SectionKind =
      spec.types.length === 1 && spec.types[0] === 'essay' ? 'essay' : 'short';

    const chosen: BankItem[] = [];
    const overrides: (number | undefined)[] = [];
    let marksSoFar = 0;
    const budget = spec.marks;


    if (kind === 'essay') {
      // Fixed rule: essay questions carry equal weight; the number of essays is
      // the budget divided by the standard 15-mark essay, at least one.
      const n = Math.max(1, Math.min(pool.length || 1, Math.round(budget / 15)));
      const per = splitEven(budget, n);
      for (let i = 0; i < n; i++) {
        const item = pool[i % Math.max(pool.length, 1)];
        if (!item || used.has(item.text)) {
          const fresh = pool.find((p) => !used.has(p.text));
          if (!fresh) break;
          used.add(fresh.text);
          chosen.push(fresh);
        } else {
          used.add(item.text);
          chosen.push(item);
        }
        overrides.push(per[i]);
        marksSoFar += per[i];
      }
    } else {
      // Deterministic exact fill: bank order, never repeat an item, and never
      // overshoot the section budget.
      for (const item of pool) {
        if (marksSoFar >= budget) break;
        if (used.has(item.text)) continue;
        const m = itemMarks(item);
        if (marksSoFar + m > budget) continue;
        used.add(item.text);
        chosen.push(item);
        overrides.push(undefined);
        marksSoFar += m;
      }
      // Top up any residual marks with the smallest remaining item that fits.
      let guard = 0;
      while (marksSoFar < budget && guard++ < 50) {
        const fit = pool
          .filter((p) => !used.has(p.text) && itemMarks(p) <= budget - marksSoFar)
          .sort((a, b) => itemMarks(b) - itemMarks(a))[0];
        if (!fit) break;
        used.add(fit.text);
        chosen.push(fit);
        overrides.push(undefined);
        marksSoFar += itemMarks(fit);
      }
    }

    const questions = chosen.map((item, qi) => toQuestion(item, qi, sectionId, overrides[qi]));
    const answers = chosen.flatMap((item, qi) => collectAnswers(item, questions[qi]));
    const sectionMarks = questions.reduce((s, q) => s + q.marks, 0);

    sections.push({
      id: sectionId,
      name: spec.name || SECTION_TITLES[kind],
      title: spec.name || SECTION_TITLES[kind],
      instructions: spec.instructions?.trim() || instructionsForTypes(spec.types),
      marks: sectionMarks,
      attemptRule: { mode: 'all' },
      questions,
      presentation: { pageBreakBefore: si > 0, columns: 1 },
    });

    guideSections.push({ title: spec.name || SECTION_TITLES[kind], answers });
  });

  // Fixed rule: the paper must be worth exactly the requested total. Any residual
  // marks left by the bank are carried by the last extended-response question,
  // which is the only question type whose weight can absorb them.
  let deficit = config.totalMarks - sections.reduce((s, sec) => s + sec.marks, 0);
  if (deficit > 0) {
    for (let i = sections.length - 1; i >= 0 && deficit > 0; i--) {
      const sec = sections[i];
      const target = [...sec.questions].reverse().find((q) => !(q as any).subQuestions?.length);
      if (!target) continue;
      target.marks += deficit;
      sec.marks += deficit;
      const guide = guideSections[i]?.answers.find((a) => a.questionId === target.id);
      if (guide) guide.marks = target.marks;
      deficit = 0;
    }
  }

  const totalMarks = sections.reduce((s, sec) => s + sec.marks, 0);

  const exam: GeneratedExam = {
    header: {
      subjectName: subject.name.toUpperCase(),
      subjectCode: subject.code,
      combinations: 'ALL COMBINATIONS',
      duration: config.duration,
      marks: totalMarks,
      academicYear: config.academicYear,
      level: config.level,
      examDate: config.examDate,
      examTime: config.examTime,
      instructions: EXAM_INSTRUCTIONS,
      language: 'en',
      metadata: { coverPage: { termSemester: config.term } } as any,
    },
    sections,
  };

  // Deterministic numbering / hierarchy / validation pass.
  buildCanonicalExamStructure(exam);

  return { exam, markingGuide: { sections: guideSections } };
}

/* ---------- URL-safe config encoding (same id => same exam) ---------- */

const KEYS: (keyof ExamBuildConfig)[] = [
  'subjectId',
  'level',
  'academicYear',
  'term',
  'duration',
  'totalMarks',
  'sections',
  'sectionPlan',
  'examDate',
  'examTime',
  'seed',
  'source',
  'units',
  'cognitive',
  'sourceMaterial',
];

export function encodeConfig(config: ExamBuildConfig): string {
  const ordered: any = {};
  for (const k of KEYS) ordered[k] = config[k];
  const json = JSON.stringify(ordered);
  const b64 = typeof btoa !== 'undefined' ? btoa(json) : Buffer.from(json).toString('base64');
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeConfig(id: string): ExamBuildConfig {
  try {
    const b64 = id.replace(/-/g, '+').replace(/_/g, '/');
    const json =
      typeof atob !== 'undefined' ? atob(b64) : Buffer.from(b64, 'base64').toString('utf8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(json) };
  } catch {
    return DEFAULT_CONFIG;
  }
}
