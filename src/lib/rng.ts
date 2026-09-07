/**
 * SEEDED RANDOMNESS
 *
 * Randomness in this app is never ambient. Every random decision is derived
 * from an integer seed that travels inside the exam id, so:
 *
 *   same seed  -> byte-identical paper (reproducible, auditable)
 *   new seed   -> a genuinely different paper built to the same blueprint
 *
 * This is what makes "random exams" compliant rather than chaotic: the
 * variation is in the CONTENT SELECTION, never in the marks, the section
 * split, the numbering, or the layout.
 */

/** mulberry32 — small, fast, fully deterministic 32-bit PRNG. */
export function makeRng(seed: number): () => number {
  let a = (seed >>> 0) || 0x9e3779b9;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic string -> 32-bit seed (FNV-1a). */
export function hashSeed(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Fisher-Yates using a seeded RNG. Returns a new array; input untouched. */
export function seededShuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Deterministically rotate an array so different seeds start at different points. */
export function seededRotate<T>(items: readonly T[], seed: number): T[] {
  if (items.length === 0) return [];
  const offset = seed % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

/** A short, human-visible label for a seed, e.g. "V-4F2A". */
export function seedLabel(seed: number): string {
  return `V-${(seed >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(-4)}`;
}

/** A fresh random seed for "give me another variant". */
export function newSeed(): number {
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}
