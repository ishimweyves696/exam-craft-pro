/**
 * OUTLINE SELECTION LOGIC
 *
 * The teacher's choice is stored as the *topmost* ticked nodes: ticking a unit
 * implies every sub-unit and topic under it, so the exam URL stays short.
 * This module is pure logic shared by the upload panel and the per-section
 * picker so both behave identically. Content routing only — never layout.
 */
import type { OutlineNode, SourceBook } from './types';

export interface IndexedNode {
  node: OutlineNode;
  parentId?: string;
  ancestorIds: string[];
  descendantIds: string[];
}

export type OutlineIndex = Map<string, IndexedNode>;

/** Map every node in the book by id, with its ancestors and descendants. */
export function indexOutline(units: OutlineNode[]): OutlineIndex {
  const index: OutlineIndex = new Map();
  const walk = (node: OutlineNode, ancestors: string[]) => {
    const entry: IndexedNode = {
      node,
      parentId: ancestors[ancestors.length - 1],
      ancestorIds: ancestors,
      descendantIds: [],
    };
    index.set(node.id, entry);
    node.children.forEach((child) => walk(child, [...ancestors, node.id]));
    entry.descendantIds = collect(node.children);
  };
  units.forEach((u) => walk(u, []));
  return index;
}

function collect(nodes: OutlineNode[]): string[] {
  const ids: string[] = [];
  nodes.forEach((n) => {
    ids.push(n.id);
    ids.push(...collect(n.children));
  });
  return ids;
}

/** Every node id implied by the stored selection (ticked nodes + children). */
export function coveredIds(selected: string[], index: OutlineIndex): Set<string> {
  const covered = new Set<string>();
  selected.forEach((id) => {
    const entry = index.get(id);
    if (!entry) return;
    covered.add(id);
    entry.descendantIds.forEach((d) => covered.add(d));
  });
  return covered;
}

/** Shrink a covered set back to its topmost ids. */
export function compact(covered: Set<string>, index: OutlineIndex): string[] {
  const out: string[] = [];
  index.forEach((entry, id) => {
    if (!covered.has(id)) return;
    if (entry.ancestorIds.some((a) => covered.has(a))) return;
    out.push(id);
  });
  return out;
}

/** Tick or untick one node together with everything beneath it. */
export function toggleNode(selected: string[], id: string, index: OutlineIndex): string[] {
  const entry = index.get(id);
  if (!entry) return selected;
  const covered = coveredIds(selected, index);
  const family = [id, ...entry.descendantIds];

  if (covered.has(id)) {
    // Unticking inside a ticked parent: keep the parent's other branches.
    entry.ancestorIds.forEach((ancestorId) => {
      if (!covered.has(ancestorId)) return;
      covered.delete(ancestorId);
      (index.get(ancestorId)?.descendantIds ?? []).forEach((d) => covered.add(d));
    });
    family.forEach((f) => covered.delete(f));
  } else {
    family.forEach((f) => covered.add(f));
  }
  return compact(covered, index);
}

export type TickState = 'on' | 'off' | 'partial';

export function tickState(id: string, covered: Set<string>, index: OutlineIndex): TickState {
  if (covered.has(id)) return 'on';
  const entry = index.get(id);
  if (entry?.descendantIds.some((d) => covered.has(d))) return 'partial';
  return 'off';
}

/** How many nodes (at any depth) are currently included. */
export function countSelected(selected: string[], index: OutlineIndex): number {
  return coveredIds(selected, index).size;
}

/** Ids whose title matches the query, plus their ancestors so the tree opens. */
export function searchMatches(
  query: string,
  index: OutlineIndex,
): { visible: Set<string>; expand: Set<string>; hits: number } | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  const visible = new Set<string>();
  const expand = new Set<string>();
  let hits = 0;
  index.forEach((entry, id) => {
    if (!entry.node.title.toLowerCase().includes(q)) return;
    hits += 1;
    visible.add(id);
    entry.descendantIds.forEach((d) => visible.add(d));
    entry.ancestorIds.forEach((a) => {
      visible.add(a);
      expand.add(a);
    });
    if (entry.node.children.length) expand.add(id);
  });
  return { visible, expand, hits };
}

/** Restrict a book's outline to a set of allowed ids (used per section). */
export function pruneOutline(units: OutlineNode[], allowed: Set<string>): OutlineNode[] {
  const walk = (node: OutlineNode): OutlineNode | undefined => {
    if (allowed.has(node.id)) return node;
    const children = node.children.map(walk).filter((c): c is OutlineNode => Boolean(c));
    return children.length ? { ...node, children } : undefined;
  };
  return units.map(walk).filter((n): n is OutlineNode => Boolean(n));
}

export function bookIndex(book: SourceBook): OutlineIndex {
  return indexOutline(book.units);
}
