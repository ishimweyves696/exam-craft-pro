/**
 * SOURCE MATERIAL ONBOARDING
 *
 * The teacher uploads a book (PDF / Word / text). It is read page by page in
 * the browser with a progress bar and a cancel button, saved into device
 * storage (IndexedDB — whole textbooks do not fit in localStorage), split into
 * a three-level outline, and shown as one compact collapsible dropdown tree.
 *
 * CONTENT ONLY. Nothing chosen here changes a single formatting, numbering,
 * spacing or layout decision — those stay fixed in code.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { extractText } from "../../lib/source/parse";
import { outlineFromText } from "../../lib/source/outline";
import { deleteBook, listBooks, loadBook, newBookId, saveBook } from "../../lib/source/store";
import { bookIndex, countSelected } from "../../lib/source/selection";
import type { SourceBook, SourceBookSummary, SourceSelectionRef } from "../../lib/source/types";
import { OutlineTree } from "./OutlineTree";

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
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [error, setError] = useState<string>();
  const [treeOpen, setTreeOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController>();

  useEffect(() => {
    let alive = true;
    void listBooks().then((list) => {
      if (alive) setLibrary(list);
    });
    return () => {
      alive = false;
    };
  }, []);

  const index = useMemo(() => (book ? bookIndex(book) : undefined), [book]);
  const chosenIds = selection?.bookId === book?.id ? (selection?.nodeIds ?? []) : [];
  const chosenCount = index ? countSelected(chosenIds, index) : 0;

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
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setError(undefined);
    setProgress(0);
    setStage("Opening the file");
    try {
      const text = await extractText(file, {
        signal: controller.signal,
        onProgress: (fraction, label) => {
          setProgress(fraction);
          setStage(label);
        },
      });
      setStage("Building the outline");
      const units = outlineFromText(text);
      const next: SourceBook = {
        id: newBookId(),
        title: titleFromFileName(file.name) || "Uploaded book",
        fileName: file.name,
        createdAt: new Date().toISOString(),
        charCount: text.length,
        units,
      };
      setStage("Saving to this device");
      setLibrary(await saveBook(next));
      onBook(next);
      setTreeOpen(true);
      emit(
        next,
        units.map((u) => u.id),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "That file could not be read.");
    } finally {
      abortRef.current = undefined;
      setBusy(false);
      setProgress(0);
      setStage("");
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const chooseBook = async (id: string) => {
    const found = await loadBook(id);
    if (!found) return;
    onBook(found);
    setTreeOpen(true);
    emit(
      found,
      found.units.map((u) => u.id),
    );
  };

  const removeBook = async (id: string) => {
    setLibrary(await deleteBook(id));
    if (book?.id === id) {
      onBook(undefined);
      onSelection(undefined);
    }
  };

  const clearBook = () => {
    onBook(undefined);
    onSelection(undefined);
  };

  const setStrictness = (value: "book_only" | "book_first") => {
    if (!selection) return;
    onSelection({ ...selection, strictness: value });
  };

  const summaryLabel = !book
    ? ""
    : chosenCount === 0
      ? "No parts selected"
      : chosenIds.length === book.units.length &&
          book.units.every((u) => chosenIds.includes(u.id))
        ? "Whole book selected"
        : `${chosenCount} parts selected`;

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Source material <span className="font-normal normal-case">(optional)</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload the book or notes your class is using, then tick the units, sub-units or
            topics the exam should come from. The book stays on this device — only the parts you
            tick are used to write questions.
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
          {busy ? (
            <div className="rounded-lg border border-border bg-accent/30 p-4">
              <p className="text-sm font-medium text-foreground">{stage || "Reading your book…"}</p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.max(4, Math.round(progress * 100))}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  Big textbooks can take a minute. You can keep this tab open and wait.
                </span>
                <button
                  type="button"
                  onClick={() => abortRef.current?.abort()}
                  className="rounded-md border border-input px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input px-4 py-8 text-center transition-colors hover:bg-accent/50">
              <input
                ref={fileRef}
                type="file"
                accept={ACCEPT}
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
              <span className="text-sm font-semibold text-foreground">
                Upload a book — PDF, Word (.docx) or text
              </span>
              <span className="text-xs text-muted-foreground">
                Tap to choose a file. Whole textbooks are supported; you can cancel at any time.
              </span>
            </label>
          )}

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
                      onClick={() => void chooseBook(b.id)}
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
                      onClick={() => void removeBook(b.id)}
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
          <div className="rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setTreeOpen((o) => !o)}
              aria-expanded={treeOpen}
              className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {book.title}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {book.units.length} units · {summaryLabel}
                </span>
              </span>
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                {treeOpen ? "Hide contents ▲" : "Choose contents ▼"}
              </span>
            </button>

            {treeOpen ? (
              <div className="space-y-3 border-t border-border p-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      emit(
                        book,
                        book.units.map((u) => u.id),
                      )
                    }
                    className="rounded-md border border-input px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    Select whole book
                  </button>
                  <button
                    type="button"
                    onClick={() => emit(book, [])}
                    className="rounded-md border border-input px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    Clear
                  </button>
                </div>

                <OutlineTree
                  idPrefix="src"
                  units={book.units}
                  value={chosenIds}
                  onChange={(ids) => emit(book, ids)}
                />
              </div>
            ) : null}
          </div>

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
