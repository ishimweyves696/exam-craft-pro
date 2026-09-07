/**
 * OUTLINE DETECTION
 *
 * Turns raw book text into a nested outline (units → sub-units → topics) using
 * the heading conventions Rwandan textbooks and REB modules actually use:
 *   "UNIT 3: CELL DIVISION", "Chapter 4 — Trade", "3.2 Mitosis", "3.2.1 Phases"
 * When no headings are found the text is split into even parts so the teacher
 * can still choose the portion of the book an exam should come from.
 */
import type { OutlineNode } from './types';

const UNIT_RE =
  /^\s*(?:unit|chapter|module|topic|part)\s+([0-9]{1,2}|[ivxIVX]{1,5})\s*[:.\-–—)]?\s*(.{0,90})$/i;
const NUMBERED_UNIT_RE = /^\s*([0-9]{1,2})\s*[.)]\s+([A-Z][^.]{2,90})$/;
const SUBUNIT_RE = /^\s*([0-9]{1,2})\.([0-9]{1,2})(?:\.([0-9]{1,2}))?\s*[:.\-–—)]?\s+(.{2,90})$/;

const clean = (s: string) => s.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

function titleCase(raw: string, fallback: string): string {
  const t = raw.replace(/\s+/g, ' ').trim();
  if (!t) return fallback;
  if (t === t.toUpperCase() && t.length > 3) {
    return t.toLowerCase().replace(/(^|\s)(\w)/g, (_, a, b) => a + b.toUpperCase());
  }
  return t;
}

interface Heading {
  line: number;
  level: 1 | 2 | 3;
  title: string;
}

function findHeadings(lines: string[]): Heading[] {
  const out: Heading[] = [];
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.length > 110) return;

    const unit = UNIT_RE.exec(line);
    if (unit) {
      out.push({ line: i, level: 1, title: titleCase(line, `Unit ${unit[1]}`) });
      return;
    }
    const sub = SUBUNIT_RE.exec(line);
    if (sub) {
      out.push({
        line: i,
        level: sub[3] ? 3 : 2,
        title: titleCase(line, `Section ${sub[1]}.${sub[2]}`),
      });
      return;
    }
    const numbered = NUMBERED_UNIT_RE.exec(line);
    if (numbered) {
      out.push({ line: i, level: 1, title: titleCase(line, `Unit ${numbered[1]}`) });
      return;
    }
    // ALL-CAPS standalone heading, e.g. "PHOTOSYNTHESIS"
    if (
      line.length >= 4 &&
      line.length <= 60 &&
      line === line.toUpperCase() &&
      /[A-Z]/.test(line) &&
      !/[.!?;]$/.test(line)
    ) {
      out.push({ line: i, level: 1, title: titleCase(line, line) });
    }
  });
  return out;
}

function sizeOf(node: OutlineNode): number {
  return node.text.length + node.children.reduce((n, c) => n + sizeOf(c), 0);
}

function evenChunks(text: string, count: number): OutlineNode[] {
  const size = Math.ceil(text.length / count);
  const units: OutlineNode[] = [];
  for (let i = 0; i < count; i++) {
    const slice = text.slice(i * size, (i + 1) * size).trim();
    if (!slice) continue;
    units.push({
      id: `u${i + 1}`,
      title: `Part ${i + 1}`,
      text: slice,
      level: 1,
      size: slice.length,
      children: [],
    });
  }
  return units;
}

/** Build the nested outline for a book's plain text. */
export function outlineFromText(text: string): OutlineNode[] {
  const normalised = text.replace(/\r\n?/g, '\n');
  const lines = normalised.split('\n');
  const headings = findHeadings(lines);
  const topLevel = headings.filter((h) => h.level === 1);

  if (topLevel.length < 2) {
    const parts = Math.min(16, Math.max(3, Math.round(normalised.length / 8000)));
    return evenChunks(normalised, parts);
  }

  const body = (from: number, to: number) => clean(lines.slice(from, to).join('\n'));

  /** Build children of one heading window using a stack-free recursive pass. */
  function build(
    parentId: string,
    level: 2 | 3,
    from: number,
    to: number,
  ): { own: [number, number]; children: OutlineNode[] } {
    const here = headings.filter((h) => h.level === level && h.line > from && h.line < to);
    if (!here.length) return { own: [from + 1, to], children: [] };
    const children: OutlineNode[] = here.map((h, i) => {
      const end = here[i + 1]?.line ?? to;
      const id = `${parentId}${level === 2 ? 's' : 't'}${i + 1}`;
      const inner =
        level === 2 ? build(id, 3, h.line, end) : { own: [h.line + 1, end] as [number, number], children: [] };
      const node: OutlineNode = {
        id,
        title: h.title,
        text: body(inner.own[0], inner.own[1]),
        level,
        size: 0,
        children: inner.children,
      };
      node.size = sizeOf(node);
      return node;
    });
    return { own: [from + 1, here[0].line], children };
  }

  const units: OutlineNode[] = topLevel.map((h, ui) => {
    const end = topLevel[ui + 1]?.line ?? lines.length;
    const unitId = `u${ui + 1}`;
    const inner = build(unitId, 2, h.line, end);
    const node: OutlineNode = {
      id: unitId,
      title: h.title,
      text: body(inner.own[0], inner.own[1]),
      level: 1,
      size: 0,
      children: inner.children,
    };
    node.size = sizeOf(node);
    return node;
  });

  // Drop headings that captured no content at all — usually a contents page.
  const useful = units.filter((u) => u.size > 40);
  return useful.length >= 2 ? useful : units;
}
