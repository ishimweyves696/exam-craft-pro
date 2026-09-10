/**
 * PAST PAPERS → GENERATION PAYLOAD (fresh mode)
 *
 * When the teacher asks for NEW questions in the style of their uploads, the
 * uploaded questions are handed to the model as reference excerpts, exactly
 * the way an uploaded textbook is. The model sees house style and content
 * only; the paper's shape comes from the blueprint (code) and its layout from
 * the print rules (code).
 */
import type { MaterialExcerpt, MaterialPayload } from '../source/types';
import type { PastPaper } from './types';

const MAX_PER_SECTION = 6;
const MAX_CHARS = 1200;

function clip(text: string): string {
  return text.length > MAX_CHARS ? `${text.slice(0, MAX_CHARS)}…` : text;
}

/**
 * Excerpts are pinned to the section they came from, so Section A exemplars
 * only ever shape Section A questions.
 */
export function pastPaperPayload(papers: PastPaper[]): MaterialPayload | undefined {
  const readable = papers.filter((p) => !p.unreadable);
  if (!readable.length) return undefined;

  const bySection: Record<string, MaterialExcerpt[]> = {};
  const global: MaterialExcerpt[] = [];

  readable.forEach((paper) => {
    paper.sections
      .filter((s) => s.questions.length)
      .forEach((section, si) => {
        const id = `sec_${si + 1}`;
        const list = (bySection[id] ??= []);
        section.questions.slice(0, MAX_PER_SECTION).forEach((q) => {
          if (list.length >= MAX_PER_SECTION * readable.length) return;
          list.push({
            title: `${paper.year} · ${section.name} · ${q.marks} marks`,
            text: clip(
              [q.text, ...(q.subParts ?? []).map((p) => `- ${p.text}`)].join('\n'),
            ),
          });
        });
      });
  });

  const years = [...new Set(readable.map((p) => p.year).filter(Boolean))].join(', ');

  return {
    bookTitle: years ? `Past papers (${years})` : 'Past papers',
    // Fresh questions must be new, so the model may use standard curriculum
    // knowledge as long as it keeps the uploaded papers' style and demand.
    strictness: 'book_first',
    global,
    bySection,
  };
}
