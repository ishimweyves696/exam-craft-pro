/**
 * EXAM CONTENT PLAN
 *
 * The plan is computed entirely in code, BEFORE the AI is ever called.
 * It decides how many questions of each type the paper needs so that the
 * fixed section weights and the requested total marks can be met exactly.
 *
 * The AI is never asked "design an exam". It is asked "write N questions of
 * this exact type, for this subject and level, on these topics". That is the
 * single most important reason the output stays consistent: the shape of the
 * paper is not a model decision.
 */
import type { BankType } from '../examBank';
import {
  MARKS_BY_TYPE,
  planTotalMarks,
  resolveSectionPlan,
  defaultLanguageFor,
  type ExamBuildConfig,
  type PaperLanguage,
  type SectionKind,
} from '../examBuilder';
import { makeRng, seededRotate } from '../rng';
import { formatProfileFor, levelBand, BAND_LABEL, type LevelBand } from '../levelFormats';
import { curriculumFor, resolveUnits } from '../../data/rebCurriculum';
import { syllabusLines } from '../../data/curriculum';
import { sectionRuleFor, type SectionRule } from '../examArchitecture';

import type { MaterialExcerpt, MaterialPayload } from '../source/types';

export interface TypeQuota {
  type: BankType;
  /** Section this batch is written for. */
  sectionId: string;
  sectionName: string;
  /** Minimum needed to fill the paper. */
  needed: number;
  /** How many to actually ask the AI for (includes a rejection margin). */
  request: number;
  /** Book excerpts this batch must be written from, when the teacher gave any. */
  excerpts?: MaterialExcerpt[];
  /** Advanced shape asked for by the teacher: sub-parts per structured item. */
  subMin?: number;
  subMax?: number;
  partsPerSub?: number;
  /** The subject's fixed rule for this section: what it exists to test. */
  rule?: SectionRule;
}

export interface ExamPlan {
  subjectId: string;
  subjectName: string;
  level: string;
  term: string;
  totalMarks: number;
  sections: { kind: SectionKind; budget: number }[];
  quotas: TypeQuota[];
  /** Seeded topic rotation — different seeds emphasise different topics. */
  topics: string[];
  /** Bloom emphasis: teacher's choice, or seeded rotation when left balanced. */
  bloomEmphasis: string;
  /** REB/CBC curriculum units this paper must examine. */
  units: string[];
  /** Verified syllabus lines: unit, term and its sub-topics. Content bound. */
  syllabus: string[];

  /** CBC key competences the paper must assess. */
  competences: string[];
  /** NESA blueprint section purposes for the subject/level, when one exists. */
  blueprintNotes: string[];
  /** Primary / O-Level / A-Level — the paper architecture band. */
  band: LevelBand;
  /** Human label for the band, used to ground the model. */
  bandLabel: string;
  seed: number;
  /** Uploaded book context for the whole paper, when the teacher supplied one. */
  material?: MaterialPayload;
  /** Language the questions must be written in. */
  language: PaperLanguage;
}

const BLOOM_CYCLES = [
  'Balanced: roughly 40% recall, 40% comprehension/application, 20% analysis.',
  'Application-leaning: roughly 25% recall, 45% application, 30% analysis.',
  'Analysis-leaning: roughly 20% recall, 35% application, 45% analysis and evaluation.',
];

/** Teacher-chosen cognitive emphasis maps to a fixed Bloom distribution. */
const BLOOM_BY_CHOICE: Record<string, string> = {
  balanced: BLOOM_CYCLES[0],
  application: BLOOM_CYCLES[1],
  analysis: BLOOM_CYCLES[2],
};

/**
 * Topics for a paper = the REB/CBC syllabus units for that subject and level,
 * restricted to what the teacher selected. This is the curriculum-alignment
 * guarantee: the AI only ever sees units that exist in the level's syllabus.
 */
export function topicsFor(
  subjectId: string,
  level: string,
  selectedUnits?: string[],
): string[] {
  return resolveUnits(subjectId, level, selectedUnits);
}

/**
 * Level + subject paper conventions: how a paper of this band and subject is
 * built at NESA. Code decides the layout; these notes only tell the model what
 * kind of CONTENT such a paper contains.
 */
function blueprintNotesFor(subjectName: string, level: string): string[] {
  return formatProfileFor(subjectName, level).conventions;
}


export function planExam(
  config: ExamBuildConfig,
  subjectName: string,
  material?: MaterialPayload,
): ExamPlan {
  const specs = resolveSectionPlan(config);
  /** key = `${sectionId}|${type}` — quotas are per section so a section can be
   * tied to its own book units. */
  const needed = new Map<string, { sectionId: string; sectionName: string; type: BankType; count: number }>();

  /** Advanced sub-part shape the teacher asked for, per section. */
  const shape = new Map<string, { subMin?: number; subMax?: number; partsPerSub?: number }>();

  const bump = (sectionId: string, sectionName: string, type: BankType, count: number) => {
    const key = `${sectionId}|${type}`;
    const prev = needed.get(key);
    if (prev) prev.count += Math.max(0, count);
    else needed.set(key, { sectionId, sectionName, type, count: Math.max(0, count) });
  };

  // The teacher owns each section's marks and question types; the AI is only
  // told how many items of each type the paper needs to be exactly filled.
  specs.forEach((spec) => {
    const types = spec.types;
    shape.set(spec.id, {
      subMin: spec.subMin,
      subMax: spec.subMax,
      partsPerSub: spec.partsPerSub,
    });
    const wanted = Math.max(0, Math.floor(spec.questionCount ?? 0));
    if (wanted > 0) {
      // The teacher fixed the number of questions: split it across the types.
      const per = Math.max(1, Math.round(wanted / types.length));
      types.forEach((t) => bump(spec.id, spec.name, t, per));
      return;
    }
    const shares = types.map(() => spec.marks / types.length);
    types.forEach((t, i) => {
      // structured items are worth ~10 marks in practice (3 parts), not the
      // nominal single-question value; plan against the realistic weight.
      const weight = t === 'structured' ? 10 : MARKS_BY_TYPE[t];
      bump(spec.id, spec.name, t, Math.max(1, Math.round(shares[i] / weight)));
    });
  });

  const quotas: TypeQuota[] = [...needed.values()].map((entry) => {
    const n = entry.count;
    // Rejection margin: validation drops anything non-compliant, so we always
    // ask for more than we need. A short pool is the one failure the teacher
    // must never see.
    const request = n === 0 ? 0 : Math.max(n + 2, Math.ceil(n * 1.4));
    const excerpts = material
      ? material.bySection[entry.sectionId]?.length
        ? material.bySection[entry.sectionId]
        : material.global
      : undefined;
    return {
      type: entry.type,
      sectionId: entry.sectionId,
      sectionName: entry.sectionName,
      needed: n,
      request,
      excerpts: excerpts?.length ? excerpts : undefined,
      ...(shape.get(entry.sectionId) ?? {}),
    };
  });

  const rng = makeRng(config.seed || 1);
  const curriculum = curriculumFor(config.subjectId, config.level);
  const allTopics = topicsFor(config.subjectId, config.level, config.units);
  const topics = seededRotate(allTopics, Math.floor(rng() * 1000));
  const choice = config.cognitive ?? 'balanced';
  const bloomEmphasis =
    BLOOM_BY_CHOICE[choice] ?? BLOOM_CYCLES[Math.floor(rng() * BLOOM_CYCLES.length)];

  return {
    subjectId: config.subjectId,
    subjectName,
    level: config.level,
    term: config.term,
    totalMarks: planTotalMarks(specs),
    sections: specs.map((spec) => ({
      kind: (spec.types.length === 1 && spec.types[0] === 'essay'
        ? 'essay'
        : spec.types.some((t) => t === 'structured' || t === 'short_answer')
          ? 'short'
          : 'objective') as SectionKind,
      budget: spec.marks,
    })),
    quotas: quotas.filter((q) => q.request > 0),
    topics,
    units: allTopics,
    syllabus: syllabusLines(config.subjectId, config.level, config.units),

    competences: curriculum.competences,
    blueprintNotes: blueprintNotesFor(subjectName, config.level),
    band: levelBand(config.level),
    bandLabel: BAND_LABEL[levelBand(config.level)],
    bloomEmphasis,
    material,
    language: config.language ?? defaultLanguageFor(config.subjectId),
    seed: config.seed || 1,

  };
}
