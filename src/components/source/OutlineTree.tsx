/**
 * BOOK OUTLINE TREE
 *
 * One compact, collapsible tree used everywhere a teacher chooses parts of a
 * book: units → sub-units → topics, three levels deep, with a search box and
 * tri-state ticks (on / partly on / off). Rows are single-line so a 400-unit
 * textbook still reads as a short list.
 *
 * CONTENT ONLY. Nothing chosen here changes any formatting, numbering,
 * spacing or layout decision — those stay fixed in code.
 */
import { useEffect, useMemo, useState } from "react";
import type { OutlineNode } from "../../lib/source/types";
import {
  coveredIds,
  indexOutline,
  searchMatches,
  tickState,
  toggleNode,
} from "../../lib/source/selection";

interface Props {
  units: OutlineNode[];
  /** Topmost ticked ids. */
  value: string[];
  onChange: (ids: string[]) => void;
  /** Extra rows of height for the scroll area. */
  maxHeightClass?: string;
  idPrefix: string;
}

const INDENT = ["pl-0", "pl-5", "pl-10"] as const;

function shortSize(size: number) {
  if (size >= 1000) return `${Math.round(size / 1000)}k`;
  return `${size}`;
}

export function OutlineTree({
  units,
  value,
  onChange,
  maxHeightClass = "max-h-72",
  idPrefix,
}: Props) {
  const index = useMemo(() => indexOutline(units), [units]);
  const covered = useMemo(() => coveredIds(value, index), [value, index]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const search = useMemo(() => searchMatches(query, index), [query, index]);

  // A search opens the branches that contain a hit; clearing it collapses again.
  useEffect(() => {
    if (!search) return;
    setOpen((prev) => {
      const next = { ...prev };
      search.expand.forEach((id) => {
        next[id] = true;
      });
      return next;
    });
  }, [search]);

  const setAllOpen = (on: boolean) => {
    const next: Record<string, boolean> = {};
    index.forEach((entry, id) => {
      if (entry.node.children.length) next[id] = on;
    });
    setOpen(next);
  };

  const renderRow = (node: OutlineNode) => {
    if (search && !search.visible.has(node.id)) return null;
    const state = tickState(node.id, covered, index);
    const hasChildren = node.children.length > 0;
    const expanded = open[node.id] ?? false;
    const rowId = `${idPrefix}-${node.id}`;

    return (
      <li key={node.id}>
        <div
          className={
            "flex items-center gap-2 rounded-md py-1 pr-1 transition-colors hover:bg-accent/50 " +
            INDENT[node.level - 1]
          }
        >
          {hasChildren ? (
            <button
              type="button"
              aria-label={expanded ? "Collapse" : "Expand"}
              aria-expanded={expanded}
              onClick={() => setOpen((o) => ({ ...o, [node.id]: !expanded }))}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-transform hover:bg-accent"
            >
              <span className={expanded ? "rotate-90 text-[10px]" : "text-[10px]"}>▶</span>
            </button>
          ) : (
            <span className="h-5 w-5 shrink-0" />
          )}

          <input
            type="checkbox"
            id={rowId}
            checked={state === "on"}
            ref={(el) => {
              if (el) el.indeterminate = state === "partial";
            }}
            onChange={() => onChange(toggleNode(value, node.id, index))}
            className="h-4 w-4 shrink-0 accent-primary"
          />

          <label
            htmlFor={rowId}
            className={
              "min-w-0 flex-1 cursor-pointer truncate text-sm " +
              (node.level === 1
                ? "font-medium text-foreground"
                : node.level === 2
                  ? "text-foreground"
                  : "text-muted-foreground")
            }
            title={node.title}
          >
            {node.title}
          </label>

          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
            {shortSize(node.size)}
          </span>
        </div>

        {hasChildren && expanded ? (
          <ul className="border-l border-border/60">{node.children.map(renderRow)}</ul>
        ) : null}
      </li>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search units and topics"
          className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground"
        />
        <button
          type="button"
          onClick={() => setAllOpen(true)}
          className="rounded-md border border-input px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          Expand all
        </button>
        <button
          type="button"
          onClick={() => {
            setAllOpen(false);
            setQuery("");
          }}
          className="rounded-md border border-input px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        >
          Collapse all
        </button>
      </div>

      {search ? (
        <p className="text-xs text-muted-foreground">
          {search.hits ? `${search.hits} matching headings` : "No heading matches that search."}
        </p>
      ) : null}

      <ul className={`${maxHeightClass} overflow-y-auto rounded-lg border border-border p-2`}>
        {units.map(renderRow)}
      </ul>
    </div>
  );
}
