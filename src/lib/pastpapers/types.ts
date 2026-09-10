/**
 * PAST PAPERS — types
 *
 * A past paper is a teacher-uploaded exam. The app reads it for STRUCTURE and
 * CONTENT only: section names, order, instructions, marks, question types and
 * the question text itself.
 *
 * It never reads formatting. Fonts, spacing, answer lines, numbering and page
 * breaks always come from the code rules in examBuilder + the print CSS, so a
 * paper produced from an upload is laid out exactly like every other paper.
 */
import type { BankType } from '../bank/types';

/** Types the app can render with a specialised widget. */
export type KnownType = BankType;

/**
 * A question the reader could not classify. It still prints perfectly: stem,
 * sub-parts and an answer space sized from its marks — it just gets the plain
 * question block instead of a matching table or an option grid.
 */
export const GENERIC_TYPE = 'generic' as const;

export interface PastSubPart {
  text: string;
  marks?: number;
  parts?: { text: string; marks?: number }[];
}

export interface PastQuestion {
  id: string;
  /** Question stem, with the original numbering and mark tags stripped. */
  text: string;
  marks: number;
  type: KnownType | typeof GENERIC_TYPE;
  options?: { text: string; isCorrect?: boolean }[];
  pairs?: { left: string; right: string }[];
  subParts?: PastSubPart[];
  /** 0-1. Below REVIEW_THRESHOLD the teacher is asked to confirm it. */
  confidence: number;
  needsReview?: boolean;
  reviewReason?: string;
}

export interface PastSection {
  id: string;
  /** Heading exactly as written on the uploaded paper. */
  name: string;
  instructions?: string;
  order: number;
  questions: PastQuestion[];
}

export interface PastPaper {
  id: string;
  subjectId: string;
  level: string;
  /** Free text: "2023", "2024 Mock", "Term 2 2025". */
  year: string;
  fileName: string;
  createdAt: string;
  sections: PastSection[];
  /** Set when the file had no readable text (scan / photo of handwriting). */
  unreadable?: boolean;
  charCount: number;
}

export interface PastPaperSummary {
  id: string;
  subjectId: string;
  level: string;
  year: string;
  fileName: string;
  createdAt: string;
  sectionCount: number;
  questionCount: number;
  reviewCount: number;
}

/** One question position in the learned paper shape. */
export interface BlueprintSlot {
  type: KnownType | typeof GENERIC_TYPE;
  marks: number;
  /** Deepest sub-part nesting seen at this position (0, 1 or 2). */
  depth: number;
}

export interface BlueprintSection {
  id: string;
  name: string;
  instructions?: string;
  order: number;
  slots: BlueprintSlot[];
  marks: number;
}

/** The consolidated shape of every uploaded paper for one subject + level. */
export interface PaperBlueprint {
  subjectId: string;
  level: string;
  /** Papers this shape was learned from. */
  paperIds: string[];
  sections: BlueprintSection[];
  totalMarks: number;
}

export const REVIEW_THRESHOLD = 0.6;
