/**
 * BLUEPRINT — the learned shape of a set of past papers.
 *
 * Pure and deterministic: the same uploads always produce the same shape.
 * The blueprint decides HOW MANY questions, of WHICH type, worth HOW MANY
 * marks, in WHICH section — never how any of it looks on the page.
 */
import type {
  BlueprintSection,
  BlueprintSlot,
  PaperBlueprint,
  PastPaper,
  PastQuestion,
} from './types';

/** Most frequent value; ties break towards the smaller/earlier value. */
function mode<T extends string | number>(values: T[], fallback: T): T {
  if (!values.length) return fallback;
  const counts = new Map<T, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  let best = values[0];
  let bestCount = 0;
  for (const v of [...counts.keys()].sort((a, b) => String(a).localeCompare(String(b)))) {
    const c = counts.get(v)!;
    if (c > bestCount) {
      best = v;
      bestCount = c;
    }
  }
  return best ?? fallback;
}

function depthOf(q: PastQuestion): number {
  if (!q.subParts?.length) return 0;
  return q.subParts.some((p) => p.parts?.length) ? 2 : 1;
}

/** Papers are matched section by section, in order. */
export function buildBlueprint(papers: PastPaper[]): PaperBlueprint | undefined {
  const usable = papers.filter((p) => !p.unreadable && p.sections.some((s) => s.questions.length));
  if (!usable.length) return undefined;

  const sectionCount = mode(
    usable.map((p) => p.sections.filter((s) => s.questions.length).length),
    1,
  );

  const sections: BlueprintSection[] = [];
  for (let i = 0; i < sectionCount; i++) {
    const peers = usable
      .map((p) => p.sections.filter((s) => s.questions.length)[i])
      .filter(Boolean);
    if (!peers.length) continue;

    const name = mode(
      peers.map((s) => s.name),
      `SECTION ${String.fromCharCode(65 + i)}`,
    );
    const instructions = peers.map((s) => s.instructions).find(Boolean);
    const slotCount = mode(
      peers.map((s) => s.questions.length),
      peers[0].questions.length,
    );

    const slots: BlueprintSlot[] = [];
    for (let j = 0; j < slotCount; j++) {
      const atSlot = peers.map((s) => s.questions[j]).filter(Boolean);
      if (!atSlot.length) continue;
      slots.push({
        type: mode(
          atSlot.map((q) => q.type),
          atSlot[0].type,
        ),
        marks: mode(
          atSlot.map((q) => q.marks),
          atSlot[0].marks,
        ),
        depth: mode(atSlot.map(depthOf), 0),
      });
    }

    sections.push({
      id: `sec_${i + 1}`,
      name,
      instructions,
      order: i,
      slots,
      marks: slots.reduce((sum, s) => sum + s.marks, 0),
    });
  }

  return {
    subjectId: usable[0].subjectId,
    level: usable[0].level,
    paperIds: usable.map((p) => p.id),
    sections,
    totalMarks: sections.reduce((sum, s) => sum + s.marks, 0),
  };
}
