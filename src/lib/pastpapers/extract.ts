/**
 * PAST PAPER READER — deterministic structural parse.
 *
 * Pure code, no AI: same text in, same structure out, every time. It finds
 * section headings, question numbers, sub-parts and mark tags. Anything it is
 * unsure about is flagged for the teacher's review instead of being guessed at
 * or dropped.
 */
import {
  GENERIC_TYPE,
  REVIEW_THRESHOLD,
  type KnownType,
  type PastPaper,
  type PastQuestion,
  type PastSection,
  type PastSubPart,
} from './types';

/* ---------- line classification ---------- */

const SECTION_RE =
  /^\s*(SECTION|PART|IGICE|SEHEMU|PARTIE)\s+([A-Z]|[IVX]{1,4}|\d{1,2})\b[:.\- ]*(.*)$/i;
const QUESTION_RE = /^\s*(?:Q(?:uestion)?\s*)?(\d{1,2})\s*[.)\]]\s+(.+)$/i;
const SUB_RE = /^\s*\(?([a-h])\)\s*[.)]?\s+(.+)$/;
const SUBSUB_RE = /^\s*\(?((?:i|ii|iii|iv|v|vi|vii|viii|ix|x))\)\s*[.)]?\s+(.+)$/;
const OPTION_RE = /^\s*\(?([A-Da-d])\)?\s*[.)]\s+(.+)$/;
const MARKS_RE = /\(\s*0?(\d{1,3})\s*(?:marks?|pts?|points?|amanota)\s*\)/i;
const INSTRUCTION_RE =
  /^\s*(answer|attempt|choose|write|use|do not|instructions?|répondre|subiza|jibu)\b/i;

/** Pull "(05 marks)" off a line and return the text without it. */
function takeMarks(line: string): { text: string; marks?: number } {
  const m = line.match(MARKS_RE);
  if (!m) return { text: line.trim() };
  return { text: line.replace(MARKS_RE, '').trim(), marks: Number(m[1]) };
}

function isNoise(line: string): boolean {
  const t = line.trim();
  if (!t) return true;
  if (/^page\s+\d+/i.test(t)) return true;
  if (/^\d{1,3}$/.test(t)) return true;
  if (/^[-_=.\s]+$/.test(t)) return true;
  return false;
}

/* ---------- type inference (content, not layout) ---------- */

function inferType(
  stem: string,
  options: { text: string }[],
  pairs: { left: string; right: string }[],
  subParts: PastSubPart[],
): { type: KnownType | typeof GENERIC_TYPE; confidence: number } {
  const t = stem.toLowerCase();
  if (options.length >= 3) return { type: 'mcq', confidence: 0.95 };
  if (pairs.length >= 3) return { type: 'matching', confidence: 0.9 };
  if (/\bmatch\b|\bcolumn a\b|\bhuza\b/.test(t)) return { type: 'matching', confidence: 0.7 };
  if (/true or false|true\/false|say whether|write true/.test(t))
    return { type: 'true_false', confidence: 0.85 };
  if (/_{3,}|\.{5,}\s*$|fill in the (blank|gap)/.test(stem))
    return { type: 'fill_blank', confidence: 0.8 };
  if (subParts.length >= 2) return { type: 'structured', confidence: 0.85 };
  if (/\bessay\b|discuss|to what extent|write a (composition|letter|speech)|justify/.test(t))
    return { type: 'essay', confidence: 0.8 };
  if (/^(state|explain|describe|define|outline|list|give|calculate|name|mention|why|how)\b/.test(t))
    return { type: 'short_answer', confidence: 0.75 };
  if (stem.length > 20) return { type: GENERIC_TYPE, confidence: 0.5 };
  return { type: GENERIC_TYPE, confidence: 0.25 };
}

/** Marks fall back to a fixed rule when the paper does not state them. */
function fallbackMarks(type: KnownType | typeof GENERIC_TYPE, subParts: PastSubPart[]): number {
  if (type === 'mcq' || type === 'true_false' || type === 'fill_blank') return 1;
  if (type === 'essay') return 15;
  if (type === 'matching') return 5;
  if (subParts.length) return subParts.length * 3;
  return 5;
}

/* ---------- the parse ---------- */

interface Draft {
  stem: string[];
  marks?: number;
  options: { text: string }[];
  subParts: PastSubPart[];
  lastSub?: PastSubPart;
}

function finishQuestion(draft: Draft, sectionId: string, index: number): PastQuestion | undefined {
  const stemRaw = draft.stem.join(' ').replace(/\s+/g, ' ').trim();
  if (!stemRaw) return undefined;

  const pairs: { left: string; right: string }[] = [];
  const { type, confidence } = inferType(stemRaw, draft.options, pairs, draft.subParts);
  const marks = draft.marks ?? fallbackMarks(type, draft.subParts);
  const stated = draft.marks !== undefined;
  const score = Math.min(1, confidence + (stated ? 0.1 : 0));

  return {
    id: `${sectionId}_q${index + 1}`,
    text: stemRaw,
    marks,
    type,
    options: draft.options.length ? draft.options.map((o) => ({ text: o.text })) : undefined,
    subParts: draft.subParts.length ? draft.subParts : undefined,
    confidence: score,
    needsReview: score < REVIEW_THRESHOLD || !stated,
    reviewReason:
      score < REVIEW_THRESHOLD
        ? 'The question type could not be recognised.'
        : !stated
          ? 'The paper did not state the marks, so a standard value was used.'
          : undefined,
  };
}

export interface ExtractInput {
  text: string;
  subjectId: string;
  level: string;
  year: string;
  fileName: string;
  id: string;
}

export function extractPastPaper(input: ExtractInput): PastPaper {
  const lines = input.text.split(/\r?\n/).filter((l) => !isNoise(l));

  const sections: PastSection[] = [];
  let section: PastSection | undefined;
  let draft: Draft | undefined;
  let qIndex = 0;

  const openSection = (name: string, instructions?: string) => {
    flushQuestion();
    section = {
      id: `s${sections.length + 1}`,
      name,
      instructions,
      order: sections.length,
      questions: [],
    };
    sections.push(section);
    qIndex = 0;
  };

  function flushQuestion() {
    if (!draft || !section) {
      draft = undefined;
      return;
    }
    const q = finishQuestion(draft, section.id, qIndex);
    if (q) {
      section.questions.push(q);
      qIndex++;
    }
    draft = undefined;
  }

  for (const raw of lines) {
    const line = raw.trim();

    const sec = line.match(SECTION_RE);
    if (sec) {
      const label = `${sec[1].toUpperCase()} ${sec[2].toUpperCase()}`;
      const rest = takeMarks(sec[3] ?? '');
      openSection(rest.text ? `${label}: ${rest.text.toUpperCase()}` : label);
      continue;
    }

    const q = line.match(QUESTION_RE);
    if (q) {
      if (!section) openSection('SECTION A');
      flushQuestion();
      const body = takeMarks(q[2]);
      draft = { stem: [body.text], marks: body.marks, options: [], subParts: [] };
      continue;
    }

    if (!draft) {
      // Text before the first question: an instruction line for the section.
      if (section && INSTRUCTION_RE.test(line) && !section.instructions) {
        section.instructions = line;
      }
      continue;
    }

    const ss = line.match(SUBSUB_RE);
    if (ss && draft.lastSub) {
      const body = takeMarks(ss[2]);
      draft.lastSub.parts = [...(draft.lastSub.parts ?? []), { text: body.text, marks: body.marks }];
      continue;
    }

    const sub = line.match(SUB_RE);
    if (sub) {
      const body = takeMarks(sub[2]);
      const part: PastSubPart = { text: body.text, marks: body.marks };
      draft.subParts.push(part);
      draft.lastSub = part;
      continue;
    }

    const opt = line.match(OPTION_RE);
    if (opt && draft.options.length < 6) {
      draft.options.push({ text: takeMarks(opt[2]).text });
      continue;
    }

    const cont = takeMarks(line);
    if (cont.marks !== undefined && draft.marks === undefined) draft.marks = cont.marks;
    if (cont.text) {
      if (draft.lastSub && draft.subParts.length) draft.lastSub.text += ` ${cont.text}`;
      else draft.stem.push(cont.text);
    }
  }
  flushQuestion();

  const readable = sections.some((s) => s.questions.length > 0);

  return {
    id: input.id,
    subjectId: input.subjectId,
    level: input.level,
    year: input.year,
    fileName: input.fileName,
    createdAt: new Date().toISOString(),
    sections,
    unreadable: !readable,
    charCount: input.text.length,
  };
}

/** Questions the teacher should confirm before the paper is used. */
export function reviewItems(paper: PastPaper): { section: PastSection; question: PastQuestion }[] {
  return paper.sections.flatMap((s) =>
    s.questions.filter((q) => q.needsReview).map((q) => ({ section: s, question: q })),
  );
}
