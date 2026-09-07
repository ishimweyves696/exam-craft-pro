/**
 * MATERIAL PAYLOAD
 *
 * Builds the excerpts that accompany a generation run: only the outline nodes
 * the teacher ticked, trimmed to a size the model can actually use well.
 */
import type {
  MaterialExcerpt,
  MaterialPayload,
  OutlineNode,
  SourceBook,
  SourceSelectionRef,
} from './types';

/** Per-excerpt and per-run limits: enough context, no prompt bloat. */
const MAX_EXCERPT_CHARS = 6_000;
const MAX_TOTAL_CHARS = 60_000;

export interface FlatNode {
  id: string;
  title: string;
  /** Title including its parents, e.g. "Unit 3 — Mitosis". */
  path: string;
  level: 1 | 2 | 3;
  size: number;
  parentId?: string;
  childIds: string[];
  /** All descendant ids, at any depth. */
  descendantIds: string[];
}

/** Flatten a book into selectable nodes at every level, in reading order. */
export function flattenBook(book: SourceBook): FlatNode[] {
  const out: FlatNode[] = [];
  const walk = (node: OutlineNode, parent?: FlatNode) => {
    const flat: FlatNode = {
      id: node.id,
      title: node.title,
      path: parent ? `${parent.path} — ${node.title}` : node.title,
      level: node.level,
      size: node.size,
      parentId: parent?.id,
      childIds: node.children.map((c) => c.id),
      descendantIds: [],
    };
    out.push(flat);
    node.children.forEach((c) => walk(c, flat));
    flat.descendantIds = collectIds(node.children);
  };
  book.units.forEach((u) => walk(u));
  return out;
}

function collectIds(nodes: OutlineNode[]): string[] {
  const ids: string[] = [];
  nodes.forEach((n) => {
    ids.push(n.id);
    ids.push(...collectIds(n.children));
  });
  return ids;
}

function findNode(nodes: OutlineNode[], id: string): OutlineNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    const found = findNode(n.children, id);
    if (found) return found;
  }
  return undefined;
}

/** Text of a node including everything beneath it. */
function fullText(node: OutlineNode): string {
  return [node.text, ...node.children.map((c) => `${c.title}\n${fullText(c)}`)]
    .filter(Boolean)
    .join('\n\n');
}

function titleFor(book: SourceBook, id: string): string {
  return flattenBook(book).find((n) => n.id === id)?.path ?? '';
}

function excerptFor(book: SourceBook, nodeId: string): MaterialExcerpt | undefined {
  const node = findNode(book.units, nodeId);
  if (!node) return undefined;
  const text = fullText(node).slice(0, MAX_EXCERPT_CHARS).trim();
  return text ? { title: titleFor(book, nodeId) || node.title, text } : undefined;
}

function budgeted(excerpts: MaterialExcerpt[], budget: number): MaterialExcerpt[] {
  if (!excerpts.length) return [];
  const per = Math.max(600, Math.floor(budget / excerpts.length));
  return excerpts.map((e) => ({ title: e.title, text: e.text.slice(0, per) }));
}

/**
 * Assemble the payload for one run.
 * `sectionNodeIds` pins particular nodes to particular sections; anything the
 * teacher selected but did not pin is available to the whole paper.
 */
export function buildMaterialPayload(
  book: SourceBook,
  ref: SourceSelectionRef,
  sectionNodeIds: Record<string, string[]>,
): MaterialPayload | undefined {
  const selected = ref.nodeIds.length ? ref.nodeIds : book.units.map((u) => u.id);
  if (!selected.length) return undefined;

  const pinned = new Set(Object.values(sectionNodeIds).flat());
  const globalIds = selected.filter((id) => !pinned.has(id));

  const bySection: Record<string, MaterialExcerpt[]> = {};
  let sectionCount = 0;
  for (const [sectionId, ids] of Object.entries(sectionNodeIds)) {
    const list = ids
      .map((id) => excerptFor(book, id))
      .filter((x): x is MaterialExcerpt => Boolean(x));
    if (list.length) {
      bySection[sectionId] = list;
      sectionCount += list.length;
    }
  }
  const globals = globalIds
    .map((id) => excerptFor(book, id))
    .filter((x): x is MaterialExcerpt => Boolean(x));

  if (!sectionCount && !globals.length) return undefined;
  const budget = Math.floor(MAX_TOTAL_CHARS / Math.max(1, Object.keys(bySection).length + 1));

  return {
    bookTitle: ref.bookTitle || book.title,
    strictness: ref.strictness ?? 'book_first',
    global: budgeted(globals, budget),
    bySection: Object.fromEntries(
      Object.entries(bySection).map(([k, v]) => [k, budgeted(v, budget)]),
    ),
  };
}
