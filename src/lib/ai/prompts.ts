/**
 * PROMPTS
 *
 * The model is never asked to "design an exam". It is asked to write N
 * questions of ONE exact type, for one subject/level, on given topics.
 * The shape of the paper is decided in code (see plan.ts), which is why the
 * output stays consistent across runs, subjects and seeds.
 */
import type { BankType } from '../examBank';
import type { ExamPlan } from './plan';
import type { MaterialExcerpt } from '../source/types';

export const SYSTEM_INSTRUCTIONS = `You are a senior Rwandan secondary-school examiner writing items for a NESA-standard end-of-term paper.

Non-negotiable rules:
- Write ONLY question content. Never write marks, question numbers, section names, instructions, answer lines or any formatting. Those are added by the system.
- Curriculum-accurate for the stated subject and level. Never above or below the level.
- Rwandan context where an example is needed (places, crops, currency in RWF, local industries) — never gratuitously.
- Unambiguous, self-contained wording. No question may depend on a diagram, passage or table that is not given in its own text.
- British English spelling. Plain text only: no markdown, no LaTeX, no bullet characters.
- Every question must be factually correct and have one defensible expected answer.`;

const TYPE_RULES: Record<BankType, string> = {
  mcq: `Multiple-choice questions.
- Exactly 4 options, exactly one correct.
- All four options must be plausible to a student who half-knows the topic.
- Options of similar length and grammatical form. Never "all of the above" or "none of the above".
- The stem must be a complete question or a completable sentence.`,
  true_false: `True/False statements.
- Each item is a STATEMENT, never a question, and never ends with "?".
- "answer" is exactly "True" or "False". Mix them roughly evenly.
- Avoid absolutes like "always"/"never" that give the answer away.`,
  fill_blank: `Fill-in-the-blank sentences.
- Each sentence contains exactly ONE blank written as six underscores: ______
- The blank must have a single unambiguous answer of one to three words.
- "answer" is only the missing words, nothing else.`,
  matching: `Matching sets.
- Each item has 4 to 6 pairs.
- Column A entries are short prompts; Column B entries are short answers.
- No repeated entries in either column; no two Column B entries could plausibly answer the same prompt.
- "text" is the lead-in sentence, e.g. "Match each term in Column A with its correct description in Column B."`,
  short_answer: `Short-answer questions.
- Answerable in two to four sentences.
- Start with a clear command verb (State, Explain, Describe, Calculate, Outline, Give reasons for).
- "answer" is the full expected answer a marker would accept.`,
  structured: `Structured questions with parts.
- Each item has 2 to 4 parts, ordered from easier to harder.
- A part may either have its own "answer" (and "parts": null), or have exactly 2 or 3 sub-parts each with text and answer (and "answer": null). Never one sub-part.
- All parts belong to the same scenario, which is stated in "text".`,
  essay: `Extended-response essay prompts.
- "text" states a substantial task requiring a structured argument or explanation (introduction, body, conclusion).
- "rubric" lists 4 to 6 specific marking points, each naming the content a marker must see.`,
};

export function buildPrompt(
  plan: ExamPlan,
  type: BankType,
  count: number,
  feedback?: string,
  material?: { excerpts: MaterialExcerpt[]; bookTitle: string; strictness: 'book_only' | 'book_first' },
  section?: SectionRule,
) {
  const topics = plan.topics.slice(0, 8).join('; ');
  const parts = [
    `Subject: ${plan.subjectName}`,
    `Level: ${plan.level} — ${plan.bandLabel}`,
    `Assessment: ${plan.term} end-of-term examination, NESA house style`,
    `Cognitive emphasis for this paper: ${plan.bloomEmphasis}`,
    `REB syllabus units for this level — you may ONLY examine content that belongs to these units: ${topics}`,
    `Key competences the paper must assess: ${plan.competences.join('; ')}`,
  ];
  if (section) {
    parts.push(
      '',
      `SECTION CONTRACT — these items are written for "${section.name}" and must fit it exactly:`,
      `- Purpose of this section: ${section.purpose}`,
      `- Dominant cognitive demand: ${COGNITIVE_LABEL[section.cognitive]}. Do not write items below or above this demand.`,
      `- Expected answer length: ${ANSWER_LENGTH_LABEL[section.answerLength]}.`,
      `- The whole section is worth ${section.marks} marks and a candidate has about ${section.minutes} minutes for it, so each item must be answerable in the time one item of this section deserves.`,
      `- Items belonging in another section of this paper are invalid here.`,
    );
  }
  parts.push(
    `Paper conventions for a ${plan.band === 'primary' ? 'Primary' : plan.band === 'olevel' ? 'O-Level' : 'A-Level'} ${plan.subjectName} paper — the items you write must fit them:`,
    ...plan.blueprintNotes.slice(0, 8).map((n) => `- ${n}`),
    `Level rule: a ${plan.band === 'alevel' ? 'Primary or O-Level style recall item' : plan.band === 'olevel' ? 'Primary-style one-word item or an A-Level style evaluation essay' : 'secondary-school style abstract item'} is INVALID in this paper. Pitch every item at ${plan.level} exactly.`,
  );
  parts.push(
    '',
    'Curriculum rule: any item testing content taught at a higher or lower level than the one stated above is invalid. Stay inside the listed units.',
    '',
    `Write ${count} ${type.replace('_', ' ')} items.`,
    TYPE_RULES[type],
    '',
    'Spread the items across the listed units; do not cluster them on one unit.',
    'Set "topic" to the REB unit the item belongs to, shortened to 2-5 words.',
    'No two items may test the same fact.',
  );
  if (material?.excerpts?.length) {
    parts.push(
      '',
      `SOURCE MATERIAL — extracts from the teacher's own book "${material.bookTitle}". Write the items from THIS material.`,
      ...material.excerpts.map((e, i) => `--- Extract ${i + 1}: ${e.title} ---\n${e.text}`),
      '',
      material.strictness === 'book_only'
        ? 'Strict rule: every item must be answerable from the extracts above alone. Do not test anything that is not stated in them.'
        : 'Rule: base every item on the extracts above. You may add standard curriculum knowledge only where it directly supports that content.',
      'Use the vocabulary, terminology, examples and spellings of the extracts.',
      'Never quote an extract heading, page number or exercise number in an item.',
      'Set "topic" to the extract title the item came from, shortened to 2-5 words.',
    );
  }

  if (feedback) {
    parts.push(
      '',
      'A previous attempt was rejected for these reasons. Do not repeat them:',
      feedback,
    );
  }
  return parts.join('\n');
}
