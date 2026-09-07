/**
 * AI COMPLIANCE GATE
 *
 * Nothing the model writes reaches the paper until it passes here.
 *
 * Three passes, in order:
 *   1. REPAIR      — fix mechanically fixable defects (whitespace, missing
 *                    blank markers, trailing punctuation, option lettering
 *                    the model added by habit, casing of True/False).
 *   2. VALIDATE    — enforce the structural contract of each question type.
 *                    A question that still fails is DROPPED, never printed.
 *   3. DEDUPLICATE — reject near-duplicates within the run and against the
 *                    static bank, so a paper never asks the same thing twice.
 *
 * Note what is NOT here: no formatting checks, because the model is never
 * given the chance to format anything. BankItem has no formatting fields.
 */
import type { BankItem, BankType } from '../examBank';

export interface RejectedItem {
  type: BankType;
  reason: string;
  text: string;
}

export interface ValidationResult {
  accepted: BankItem[];
  rejected: RejectedItem[];
}

const BANNED_OPTION_PATTERNS = [
  /^all of the above$/i,
  /^none of the above$/i,
  /^both a and b$/i,
  /^a and b$/i,
];

/** Strip lettering the model may have prefixed, e.g. "a) Mitochondrion". */
function stripLabel(s: string): string {
  return s
    .replace(/^\s*[(\[]?\s*[a-dA-D]\s*[).\]]\s+/, '')
    .replace(/^\s*[(\[]?\s*(?:i{1,3}|iv|v)\s*[).\]]\s+/i, '')
    .trim();
}

function clean(s: unknown): string {
  return typeof s === 'string' ? s.replace(/\s+/g, ' ').trim() : '';
}

/** Strip any mark annotation the model added — marks are decided by code only. */
function stripMarks(s: string): string {
  return s.replace(/\s*[([]\s*\d+\s*(?:marks?|pts?|points?)\s*[)\]]\s*$/i, '').trim();
}

function normalizeKey(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Rough overlap check to catch reworded duplicates. */
function tooSimilar(a: string, b: string): boolean {
  if (a === b) return true;
  const wa = new Set(a.split(' ').filter((w) => w.length > 3));
  const wb = new Set(b.split(' ').filter((w) => w.length > 3));
  if (wa.size < 4 || wb.size < 4) return false;
  let shared = 0;
  wa.forEach((w) => {
    if (wb.has(w)) shared++;
  });
  return shared / Math.min(wa.size, wb.size) >= 0.8;
}

/* ---------- per-type contracts ---------- */

type Check = (item: BankItem) => string | null;

const CHECKS: Record<BankType, Check> = {
  mcq: (item) => {
    const opts = item.options ?? [];
    if (opts.length !== 4) return `needs exactly 4 options, got ${opts.length}`;
    if (opts.some((o) => !o.text)) return 'has an empty option';
    if (opts.filter((o) => o.isCorrect).length !== 1) return 'must have exactly one correct option';
    const keys = opts.map((o) => normalizeKey(o.text));
    if (new Set(keys).size !== 4) return 'has duplicate options';
    if (opts.some((o) => BANNED_OPTION_PATTERNS.some((p) => p.test(o.text))))
      return 'uses a banned catch-all option';
    // A distractor far longer than the rest gives the answer away.
    const lens = opts.map((o) => o.text.length);
    if (Math.max(...lens) > Math.min(...lens) * 4 + 12) return 'option lengths are badly unbalanced';
    if (item.text.length < 15) return 'stem is too short to be a real question';
    return null;
  },
  true_false: (item) => {
    const a = (item.answer ?? '').toLowerCase();
    if (a !== 'true' && a !== 'false') return 'answer must be True or False';
    if (item.text.length < 15) return 'statement is too short';
    if (/\?$/.test(item.text)) return 'must be a statement, not a question';
    return null;
  },
  fill_blank: (item) => {
    if (!/_{3,}/.test(item.text)) return 'has no blank to fill';
    if ((item.text.match(/_{3,}/g) ?? []).length > 2) return 'has too many blanks';
    if (!item.answer) return 'missing the expected answer';
    return null;
  },
  matching: (item) => {
    const pairs = item.pairs ?? [];
    if (pairs.length < 4 || pairs.length > 6) return `needs 4-6 pairs, got ${pairs.length}`;
    if (pairs.some((p) => !p.left || !p.right)) return 'has an empty pair side';
    if (new Set(pairs.map((p) => normalizeKey(p.left))).size !== pairs.length)
      return 'has duplicate prompts in column A';
    if (new Set(pairs.map((p) => normalizeKey(p.right))).size !== pairs.length)
      return 'has duplicate answers in column B — matching would be ambiguous';
    return null;
  },
  short_answer: (item) => {
    if (item.text.length < 15) return 'question is too short';
    if (!item.answer || item.answer.length < 3) return 'missing a usable expected answer';
    return null;
  },
  structured: (item) => {
    const parts = item.parts ?? [];
    if (parts.length < 2 || parts.length > 4) return `needs 2-4 parts, got ${parts.length}`;
    for (const p of parts) {
      if (!p.text) return 'has an empty part';
      const subs = p.parts ?? [];
      if (subs.length > 3) return 'a part has more than 3 sub-parts';
      if (subs.length === 1) return 'a part has a single sub-part, which cannot be numbered (i)(ii)';
      if (subs.length === 0 && !p.answer) return 'a part is missing its expected answer';
      if (subs.some((s) => !s.text || !s.answer)) return 'a sub-part is incomplete';
    }
    return null;
  },
  essay: (item) => {
    if (item.text.length < 30) return 'essay prompt is too thin';
    const rubric = item.rubric ?? [];
    if (rubric.length < 3) return 'needs at least 3 rubric points for marking';
    if (rubric.some((r) => !r || r.length < 5)) return 'has an empty rubric point';
    return null;
  },
};

/* ---------- repair ---------- */

function repair(raw: BankItem): BankItem {
  const item: BankItem = {
    ...raw,
    text: stripMarks(stripLabel(clean(raw.text))),
    topic: clean(raw.topic) || 'General',
  };

  if (raw.options) {
    item.options = raw.options
      .map((o) => ({ text: stripLabel(clean(o.text)), isCorrect: !!o.isCorrect }))
      .filter((o) => o.text.length > 0);
    const correct = item.options.find((o) => o.isCorrect);
    if (correct) item.answer = correct.text;
  }

  if (raw.pairs) {
    item.pairs = raw.pairs
      .map((p) => ({ left: stripLabel(clean(p.left)), right: stripLabel(clean(p.right)) }))
      .filter((p) => p.left && p.right);
  }

  if (raw.rubric) {
    item.rubric = raw.rubric.map((r) => stripLabel(clean(r))).filter(Boolean);
  }

  if (raw.parts) {
    item.parts = raw.parts.map((p) => ({
      text: stripMarks(stripLabel(clean(p.text))),
      answer: clean(p.answer) || undefined,
      parts: p.parts?.map((s) => ({
        text: stripMarks(stripLabel(clean(s.text))),
        answer: clean(s.answer) || undefined,
      })),
    }));
  }

  if (item.type === 'true_false' && item.answer) {
    const a = clean(item.answer).toLowerCase();
    if (['true', 't', 'yes', 'correct'].includes(a)) item.answer = 'True';
    else if (['false', 'f', 'no', 'incorrect'].includes(a)) item.answer = 'False';
  }

  if (item.type === 'fill_blank') {
    // Models often write "…is called ______." with the wrong marker.
    item.text = item.text
      .replace(/\.{3,}/g, '______')
      .replace(/\[\s*blank\s*\]/gi, '______')
      .replace(/_{3,}/g, '______');
    if (item.answer) item.answer = clean(item.answer);
  }

  if (item.answer) item.answer = clean(item.answer);
  return item;
}

/* ---------- entry point ---------- */

export function validateItems(
  rawItems: BankItem[],
  opts: { existing?: BankItem[] } = {},
): ValidationResult {
  const accepted: BankItem[] = [];
  const rejected: RejectedItem[] = [];
  const seen = (opts.existing ?? []).map((i) => normalizeKey(i.text));

  for (const raw of rawItems) {
    if (!raw || !CHECKS[raw.type]) {
      rejected.push({ type: raw?.type ?? ('mcq' as BankType), reason: 'unknown question type', text: '' });
      continue;
    }
    const item = repair(raw);

    if (!item.text) {
      rejected.push({ type: item.type, reason: 'empty question text', text: '' });
      continue;
    }

    const failure = CHECKS[item.type](item);
    if (failure) {
      rejected.push({ type: item.type, reason: failure, text: item.text.slice(0, 90) });
      continue;
    }

    const key = normalizeKey(item.text);
    if (seen.some((s) => tooSimilar(key, s))) {
      rejected.push({ type: item.type, reason: 'duplicate of another question', text: item.text.slice(0, 90) });
      continue;
    }

    seen.push(key);
    accepted.push(item);
  }

  return { accepted, rejected };
}

/** True when the accepted pool can satisfy every planned quota. */
export function quotasMet(
  accepted: BankItem[],
  quotas: { type: BankType; needed: number }[],
): boolean {
  return quotas.every(
    (q) => accepted.filter((i) => i.type === q.type).length >= q.needed,
  );
}

export function shortfall(
  accepted: BankItem[],
  quotas: { type: BankType; needed: number }[],
): { type: BankType; missing: number }[] {
  return quotas
    .map((q) => ({
      type: q.type,
      missing: q.needed - accepted.filter((i) => i.type === q.type).length,
    }))
    .filter((s) => s.missing > 0);
}
