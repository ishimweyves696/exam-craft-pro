/**
 * PER-SECTION BOOK CONTENTS
 *
 * Lets the teacher pin particular units, sub-units or topics to one section,
 * e.g. Unit 3 for Section A, Unit 6 for Section B. Shown as a compact
 * dropdown holding the same collapsible outline tree, restricted to the parts
 * ticked for the whole paper. Content routing only — never layout.
 */
import { useMemo, useState } from "react";
import { bookIndex, coveredIds, countSelected, pruneOutline } from "../../lib/source/selection";
import type { SourceBook } from "../../lib/source/types";
import { OutlineTree } from "./OutlineTree";

interface Props {
  book: SourceBook;
  /** Parts ticked for the whole paper — the only ones a section may pin. */
  availableIds: string[];
  value: string[];
  onChange: (ids: string[]) => void;
  sectionId: string;
}

export function SectionSourcePicker({ book, availableIds, value, onChange, sectionId }: Props) {
  const [open, setOpen] = useState(false);

  const units = useMemo(() => {
    const index = bookIndex(book);
    return pruneOutline(book.units, coveredIds(availableIds, index));
  }, [book, availableIds]);

  const count = useMemo(() => {
    if (!units.length) return 0;
    const index = bookIndex({ ...book, units });
    return countSelected(value, index);
  }, [book, units, value]);

  if (!units.length) return null;

  return (
    <div className="mt-3 rounded-lg border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <span className="text-xs font-medium text-muted-foreground">
          Book contents for this section
        </span>
        <span className="text-xs font-semibold text-foreground">
          {count ? `${count} chosen ▾` : "Any selected part ▾"}
        </span>
      </button>

      {open ? (
        <div className="space-y-2 border-t border-border p-3">
          <p className="text-xs text-muted-foreground">
            Leave everything unticked to let this section use any part you selected above.
          </p>
          <OutlineTree
            idPrefix={`sec-${sectionId}`}
            units={units}
            value={value}
            onChange={onChange}
            maxHeightClass="max-h-56"
          />
          {count ? (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear this section's contents
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
