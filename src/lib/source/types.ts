/**
 * SOURCE MATERIAL — types
 *
 * A "book" is teacher-uploaded material (textbook, module, notes) split into a
 * nested outline: units → sub-units → topics (up to three levels). The teacher
 * ticks the parts the AI may use, globally or per exam section.
 * Content only: nothing here influences layout.
 */

/** One node of the book outline. Recursive so any depth reads the same way. */
export interface OutlineNode {
  id: string;
  title: string;
  /** Text belonging to this node itself (before its first child). */
  text: string;
  /** 1 = unit, 2 = sub-unit, 3 = topic. */
  level: 1 | 2 | 3;
  /** Characters in this node and everything under it — used for hints. */
  size: number;
  children: OutlineNode[];
}

export interface SourceBook {
  id: string;
  title: string;
  fileName: string;
  createdAt: string;
  charCount: number;
  /** Top-level nodes (units). */
  units: OutlineNode[];
}

export interface SourceBookSummary {
  id: string;
  title: string;
  fileName: string;
  createdAt: string;
  charCount: number;
  unitCount: number;
}

/** Small reference kept inside the exam config / URL. */
export interface SourceSelectionRef {
  bookId: string;
  bookTitle: string;
  /** Selected node ids — the whole paper's allowed content. */
  nodeIds: string[];
  /** How strictly the AI must stay inside the book. */
  strictness?: 'book_only' | 'book_first';
}

/** One excerpt handed to the model. */
export interface MaterialExcerpt {
  title: string;
  text: string;
}

/** What the client sends to the server for a generation run. */
export interface MaterialPayload {
  bookTitle: string;
  strictness: 'book_only' | 'book_first';
  /** Excerpts allowed anywhere in the paper. */
  global: MaterialExcerpt[];
  /** Excerpts pinned to a specific section id. */
  bySection: Record<string, MaterialExcerpt[]>;
}
