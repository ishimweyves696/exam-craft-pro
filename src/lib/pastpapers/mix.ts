/**
 * MIX — real questions from uploaded papers, arranged by the learned shape.
 *
 * Content selection only, and fully seeded: the same library + the same seed
 * always produce the same paper. Marks, numbering and layout still come from
 * the builder's fixed rules.
 */
import type { BankItem, BankType } from '../bank/types';
import { makeRng, seededShuffle } from '../rng';
import type { SectionSpec } from '../examBuilder';
import type { PaperBlueprint, PastPaper, PastQuestion } from './types';
import { GENERIC_TYPE } from './types';

/** Types the section may contain, derived from the slots the blueprint learned. */
function typesOf(slotTypes: (BankType | typeof GENERIC_TYPE)[]): BankType[] {
  const out = new Set<BankType>();
  slotTypes.forEach((t) => out.add(t === GENERIC_TYPE ? 'short_answer' : t));
  return [...out];
}

/** The section plan implied by the blueprint — names, order and marks. */
export function sectionPlanFromBlueprint(blueprint: PaperBlueprint): SectionSpec[] {
  return blueprint.sections.map((s) => ({
    id: s.id,
    name: s.name,
    marks: s.marks,
    types: typesOf(s.slots.map((x) => x.type)),
    instructions: s.instructions,
  }));
}

function toBankItem(q: PastQuestion, marks: number, sectionId: string): BankItem {
  // Unknown types print as a plain question block with a mark-sized answer
  // space — never as garbage, never as a wrong widget.
  const type: BankType = q.type === GENERIC_TYPE ? 'short_answer' : q.type;
  return {
    type,
    text: q.text,
    topic: 'Past paper',
    marks,
    sectionId,
    options: q.options?.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
    pairs: q.pairs,
    parts: q.subParts?.map((p) => ({
      text: p.text,
      parts: p.parts?.map((c) => ({ text: c.text })),
    })),
  };
}

/**
 * Pick one real question per blueprint slot, drawing across every uploaded
 * paper but keeping each section's questions inside that section.
 */
export function mixItems(
  papers: PastPaper[],
  blueprint: PaperBlueprint,
  seed: number,
): BankItem[] {
  const rng = makeRng(seed || 1);
  const used = new Set<string>();
  const items: BankItem[] = [];

  blueprint.sections.forEach((section, si) => {
    // Pool = the matching section of every uploaded paper, plus everything
    // else as a last resort, so a slot is never left empty.
    const sameSection = papers.flatMap((p) => {
      const peers = p.sections.filter((s) => s.questions.length);
      return peers[si]?.questions ?? [];
    });
    const everything = papers.flatMap((p) => p.sections.flatMap((s) => s.questions));
    const primary = seededShuffle(sameSection, rng);
    const secondary = seededShuffle(everything, rng);

    section.slots.forEach((slot) => {
      const wanted = slot.type;
      const pick =
        primary.find((q) => !used.has(q.id) && q.type === wanted && q.marks === slot.marks) ??
        primary.find((q) => !used.has(q.id) && q.type === wanted) ??
        secondary.find((q) => !used.has(q.id) && q.type === wanted) ??
        primary.find((q) => !used.has(q.id)) ??
        secondary.find((q) => !used.has(q.id));
      if (!pick) return;
      used.add(pick.id);
      items.push(toBankItem(pick, slot.marks, section.id));
    });
  });

  return items;
}

/** A few real questions used to ground fresh AI writing in the paper's house style. */
export function styleExemplars(
  papers: PastPaper[],
  limit = 12,
): { sectionId: string; type: string; text: string }[] {
  const out: { sectionId: string; type: string; text: string }[] = [];
  papers.forEach((p) => {
    p.sections.forEach((s, si) => {
      s.questions.slice(0, 3).forEach((q) => {
        out.push({ sectionId: `sec_${si + 1}`, type: q.type, text: q.text });
      });
    });
  });
  return out.slice(0, limit);
}
