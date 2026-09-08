import { useMemo } from "react";
import { sourcesFor, unitsDetailed } from "../data/curriculum";

/**
 * Curriculum coverage for the chosen subject + level.
 *
 * Content alignment only. Nothing here touches paper formatting: the teacher
 * picks WHICH syllabus units may be examined, and the official REB sources for
 * that subject and band are shown so the coverage can be verified.
 */
export function CurriculumPanel({
  subjectId,
  subjectName,
  level,
  selected,
  onChange,
}: {
  subjectId: string;
  subjectName: string;
  level: string;
  selected: string[];
  onChange: (units: string[]) => void;
}) {
  const units = useMemo(() => unitsDetailed(subjectId, level), [subjectId, level]);
  const sources = useMemo(() => sourcesFor(subjectId, level), [subjectId, level]);
  const allSelected = selected.length === 0;

  const toggle = (title: string) => {
    const base = allSelected ? units.map((u) => u.title) : selected;
    const next = base.includes(title) ? base.filter((t) => t !== title) : [...base, title];
    onChange(next.length === units.length ? [] : next);
  };

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Curriculum coverage
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            REB/CBC syllabus units for {subjectName} at {level}. Questions can only come from the
            units you keep ticked.
          </p>
        </div>
        {units.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="rounded-md border border-input px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
          >
            Cover whole syllabus
          </button>
        )}
      </div>

      {units.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">
          No detailed unit map yet for this subject and level — the paper will use the general
          syllabus outline for {level}.
        </p>
      ) : (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {units.map((unit) => {
            const on = allSelected || selected.includes(unit.title);
            return (
              <label
                key={unit.title}
                className={
                  on
                    ? "flex gap-3 rounded-lg border border-primary/40 bg-primary/5 p-3"
                    : "flex gap-3 rounded-lg border border-border bg-background p-3"
                }
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(unit.title)}
                  className="mt-0.5 h-4 w-4 accent-current"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{unit.title}</span>
                  <span className="mt-0.5 block text-[11px] uppercase tracking-wide text-muted-foreground">
                    Term {unit.term}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {unit.topics.join(" · ")}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}

      <div className="mt-5 rounded-lg border border-border bg-muted/40 p-3">
        <p className="text-xs font-semibold text-foreground">Official sources</p>
        <ul className="mt-2 space-y-1">
          {sources.map((s) => (
            <li key={s.url} className="text-xs">
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline underline-offset-2"
              >
                {s.label}
              </a>
              <span className="ml-2 text-muted-foreground">({s.kind})</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
