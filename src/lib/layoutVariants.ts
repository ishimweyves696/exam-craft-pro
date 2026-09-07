/**
 * Deterministic layout variety.
 *
 * Some question types look right in more than one official layout (matching as
 * a ruled table or as two facing columns; true/false answered on a dotted line
 * or in a box at the end of the line). Which one is used is decided here, in
 * code, from a stable hash of the question's identity — never by the AI and
 * never at random. The same exam rendered twice always picks the same layout.
 */

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export type MatchingLayout = 'table' | 'traditional' | 'response-column';
export type TrueFalseVariant = 'dotted' | 'box';

const MATCHING_LAYOUTS: MatchingLayout[] = ['table', 'traditional', 'response-column'];

/** Matching layout when the teacher has not pinned one. */
export function matchingLayoutFor(seed: string): MatchingLayout {
  return MATCHING_LAYOUTS[hash(`matching:${seed}`) % MATCHING_LAYOUTS.length];
}

/** True/false answering style when the teacher has not pinned one. */
export function trueFalseVariantFor(seed: string): TrueFalseVariant {
  return hash(`tf:${seed}`) % 2 === 0 ? 'dotted' : 'box';
}
