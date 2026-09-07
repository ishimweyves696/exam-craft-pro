/**
 * SOURCE MATERIAL ONBOARDING
 *
 * The teacher uploads a book (PDF / Word / text), the app splits it into units
 * and subunits in the browser, and the teacher ticks the parts the exam may be
 * written from.
 *
 * CONTENT ONLY. Nothing chosen here changes a single formatting, numbering,
 * spacing or layout decision — those stay fixed in code.
 */
import { useEffect, useRef, useState } from "react";
import { extractText } from "../../lib/source/parse";
import { outlineFromText } from "../../lib/source/outline";
import {
  deleteBook,
  listBooks,
  loadBook,
  newBookId,
  saveBook,
} from "../../lib/source/store";
import type {
  SourceBook,
  SourceBookSummary,
  SourceSelectionRef,
} from "../../lib/source/types";

interface Props {
  book?: SourceBook;
  selection?: SourceSelectionRef;
  onBook: (book: SourceBook | undefined) => void;
  onSelection: (ref: SourceSelectionRef | undefined) => void;
}

const ACCEPT = ".pdf,.docx,.txt,.md,text/plain";

function titleFromFileName(name: string) {
  return name
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function SourceMaterialPanel({ book, selection, onBook, onSelection }: Props) {
  const [library, setLibrary] = useState<SourceBookSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setLibrary(listBooks()), []);

  const selected = new Set(selection?.nodeIds ?? []);

  const emit = (nextBook: SourceBook, ids: string[]) =>
    onSelection(
      ids.length
        ? {
            bookId: nextBook.id,
            bookTitle: nextBook.title,
            nodeIds: ids,
            strictness: selection?.strictness ?? "book_first",
          }
        : undefined,
    );

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(undefined);
    try {
      const text = await extractText(file);
      const units = outlineFromText(text);
      const next: SourceBook = {
        id: newBookId(),
        title: titleFromFileName(file.name) || "Uploaded book",
        fileName: file.name,
        createdAt: new Date().toISOString(),
        charCount: text.length,
        units,
      };
      setLibrary(saveBook(next));
      onBook(next);
      setOpen({});
      emit(
        next,
        units.map((u) => u.id),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "That file could not be read.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const chooseBook = (id: string) => {
    const found = loadBook(id);
    if (!found) return;
    onBook(found);
    setOpen({});
    emit(
      found,
      found.units.map((u) => u.id),
    );
  };

  const clearBook = () => {
    onBook(undefined);
    onSelection(undefined);
  };

  const toggleNode = (id: string, childIds: string[] = []) => {
    if (!book) return;
    const next = new Set(selected);
    const turningOn = !next.has(id);
    if (turningOn) {
      next.add(id);
      childIds.forEach((c) => next.delete(c));
    } else {
      next.delete(id);
      childIds.forEach((c) => next.delete(c));
    }
    emit(book, [...next]);
  };

  const toggleSub = (unitId: string, subId: string) => {
    if (!book) return;
    const next = new Set(selected);
    if (next.has(subId)) next.delete(subId);
    else {
      next.add(subId);
      next.delete(unitId); // a subunit choice replaces the whole-unit choice
    }
    emit(book, [...next]);
  };

  const selectAll = (on: boolean) => {
    if (!book) return;
    emit(book, on ? book.units.map((u) => u.id) : []);
  };

  const setStrictness = (value: "book_only" | "book_first") => {
    if (!selection) return;
    onSelection({ ...selection, strictness: value });
  };

  const chosenCount = selection?.nodeIds.length ?? 0;

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Source material <span className="font-normal normal-case">(optional)</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload the book or notes your class is using, then tick the units the exam should
            come from. The book stays on this device — only the parts you tick are used to write
            questions.
          </p>
        </div>
        {book ? (
          <button
            type="button"
            onClick={clearBook}
            className="rounded-md border border-input px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            Use no book
          </button>
        ) : null}
      </div>

      {!book ? (
        <div className="mt-4 space-y-3">
          <label
            className={
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input px-4 py-8 text-center transition-colors hover:bg-accent/50" +
              (busy ? " opacity-60" : "")
            }
          >
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            <span className="text-sm font-semibold text-foreground">
              {busy ? "Reading your book…" : "Upload a book — PDF, Word (.docx) or text"}
            </span>
            <span className="text-xs text-muted-foreground">
              Tap to choose a file. Large books may take a few seconds to split into units.
            </span>
          </label>

          {library.length ? (
            <div>
              <p className="text-xs font-medium text-muted-foreground">Books on this device</p>
              <ul className="mt-2 space-y-2">
                {library.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                  >
                    <button
                      type="button"
                      onClick={() => chooseBook(b.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <span className="block truncate text-sm font-medium text-foreground">
                        {b.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {b.unitCount} units · {Math.round(b.charCount / 1000)}k characters
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLibrary(deleteBook(b.id))}
                      className="text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-accent/30 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{book.title}</p>
              <p className="text-xs text-muted-foreground">
                {book.units.length} units · {chosenCount} selected
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => selectAll(true)}
                className="rounded-md border border-input px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => selectAll(false)}
                className="rounded-md border border-input px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                Clear
              </button>
            </div>
          </div>

          <ul className="max-h-80 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
            {book.units.map((unit) => {
              const subIds = unit.subunits.map((s) => s.id);
              const unitOn = selected.has(unit.id);
              const someSub = subIds.some((id) => selected.has(id));
              const expanded = open[unit.id] ?? false;
              return (
                <li key={unit.id} className="rounded-md">
                  <div className="flex items-center gap-2 px-1 py-1.5">
                    <input
                      type="checkbox"
                      id={`u-${unit.id}`}
                      checked={unitOn}
                      ref={(el) => {
                        if (el) el.indeterminate = !unitOn && someSub;
                      }}
                      onChange={() => toggleNode(unit.id, subIds)}
                      className="h-4 w-4 shrink-0"
                    />
                    <label
                      htmlFor={`u-${unit.id}`}
                      className="min-w-0 flex-1 cursor-pointer truncate text-sm font-medium text-foreground"
                    >
                      {unit.title}
                    </label>
                    {unit.subunits.length ? (
                      <button
                        type="button"
                        onClick={() => setOpen((o) => ({ ...o, [unit.id]: !expanded }))}
                        aria-expanded={expanded}
                        className="shrink-0 rounded px-2 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent"
                      >
                        {expanded ? "Hide" : `${unit.subunits.length} sub-units`}
                      </button>
                    ) : null}
                  </div>
                  {expanded ? (
                    <ul className="mb-1 ml-6 space-y-1 border-l border-border pl-3">
                      {unit.subunits.map((sub) => (
                        <li key={sub.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`s-${sub.id}`}
                            checked={selected.has(sub.id) || unitOn}
                            disabled={unitOn}
                            onChange={() => toggleSub(unit.id, sub.id)}
                            className="h-4 w-4 shrink-0"
                          />
                          <label
                            htmlFor={`s-${sub.id}`}
                            className="min-w-0 flex-1 cursor-pointer truncate py-1 text-sm text-foreground"
                          >
                            {sub.title}
                          </label>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <fieldset className="space-y-2">
            <legend className="text-xs font-medium text-muted-foreground">
              How closely should questions follow the book?
            </legend>
            {(
              [
                {
                  key: "book_first",
                  label: "Book first",
                  hint: "Questions are built on the book, with standard curriculum knowledge where it helps.",
                },
                {
                  key: "book_only",
                  label: "Book only",
                  hint: "Every question must be answerable from the selected pages alone.",
                },
              ] as const
            ).map((opt) => (
              <label
                key={opt.key}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50"
              >
                <input
                  type="radio"
                  name="strictness"
                  className="mt-1"
                  checked={(selection?.strictness ?? "book_first") === opt.key}
                  onChange={() => setStrictness(opt.key)}
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">{opt.label}</span>
                  <span className="block text-xs text-muted-foreground">{opt.hint}</span>
                </span>
              </label>
            ))}
          </fieldset>
        </div>
      )}

      {error ? <p className="mt-3 text-xs font-medium text-destructive">{error}</p> : null}
    </section>
  );
}
