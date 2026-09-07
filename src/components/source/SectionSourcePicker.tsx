/**
 * PER-SECTION BOOK UNITS
 *
 * Lets the teacher pin particular units of the uploaded book to one section,
 * e.g. Unit 3 for Section A, Unit 6 for Section B. Content routing only.
 */
import { useState } from "react";
import { flattenBook } from "../../lib/source/payload";
import type { SourceBook } from "../../lib/source/types";

interface Props {
  book: SourceBook;
  /** Units ticked for the whole paper — the only ones a section may pin. */
  availableIds: string[];
  value: string[];
  onChange: (ids: string[]) => void;
}

export function SectionSourcePicker({ book, availableIds, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const nodes = flattenBook(book).filter((n) => availableIds.includes(n.id));
  if (!nodes.length) return null;

  const chosen = new Set(value);
  const toggle = (id: string) => {
    const next = new Set(chosen);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  return (
    <div className="mt-3 rounded-lg border border-border p-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="text-xs font-medium text-muted-foreground">Book units for this section</span>
        <span className="text-xs font-semibold text-foreground">
          {chosen.size ? `${chosen.size} chosen` : "All selected units"}
        </span>
      </button>

      {open ? (
        <div className="mt-3 space-y-1">
          <p className="text-xs text-muted-foreground">
            Leave everything unticked to let this section use any unit you selected above.
          </p>
          <ul className="max-h-52 space-y-1 overflow-y-auto">
            {nodes.map((n) => (
              <li key={n.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`sec-src-${n.id}-${value.length}`}
                  checked={chosen.has(n.id)}
                  onChange={() => toggle(n.id)}
                  className="h-4 w-4 shrink-0"
                />
                <label
                  htmlFor={`sec-src-${n.id}-${value.length}`}
                  className="min-w-0 flex-1 cursor-pointer truncate py-1 text-sm text-foreground"
                >
                  {n.title}
                </label>
              </li>
            ))}
          </ul>
          {chosen.size ? (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear this section's units
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
