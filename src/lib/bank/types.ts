/**
 * CONTENT BANK — shared types.
 * Content only. No formatting, spacing, or layout decisions here.
 * Layout/format is decided exclusively by the engines + print CSS.
 */

export type BankType =
  | 'mcq'
  | 'true_false'
  | 'matching'
  | 'fill_blank'
  | 'short_answer'
  | 'structured'
  | 'essay';

export interface BankItem {
  type: BankType;
  text: string;
  topic: string;
  options?: { text: string; isCorrect?: boolean }[];
  /** matching: left column prompts, right column answer pool */
  pairs?: { left: string; right: string }[];
  answer?: string;
  rubric?: string[];
  /** structured: level-2 parts, each optionally with level-3 parts */
  parts?: { text: string; answer?: string; parts?: { text: string; answer?: string }[] }[];
  /**
   * Marks stated by the source (past-paper uploads only). Content-side fact,
   * not a layout decision: when absent the fixed MARKS_BY_TYPE rules apply.
   */
  marks?: number;
  /** Section this item was written for, when the teacher pinned book units to it. */
  sectionId?: string;
}

export interface SubjectEntry {
  id: string;
  name: string;
  code: string;
  levels: string[];
  items: BankItem[];
}

/** Helper for authoring MCQ items concisely. */
export const mcq = (
  text: string,
  topic: string,
  opts: [string, string, string, string],
  correct: number,
): BankItem => ({
  type: 'mcq',
  text,
  topic,
  options: opts.map((t, i) => ({ text: t, isCorrect: i === correct })),
  answer: opts[correct],
});
