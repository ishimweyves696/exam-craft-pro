import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SUBJECTS } from "../lib/examBank";
import type { BankType } from "../lib/examBank";
import {
  DEFAULT_CONFIG,
  DEFAULT_SECTION_PLAN,
  QUESTION_TYPE_OPTIONS,
  encodeConfig,
  instructionsForTypes,
  planTotalMarks,
  type ExamBuildConfig,
  type SectionSpec,
} from "../lib/examBuilder";
import { LEVEL_OPTIONS, formatProfileFor, levelBand } from "../lib/levelFormats";
import { sectionRuleFor } from "../lib/examArchitecture";
import { StudioShell } from "../components/studio/StudioShell";
import { SourceMaterialPanel } from "../components/source/SourceMaterialPanel";
import { SectionSourcePicker } from "../components/source/SectionSourcePicker";
import type { SourceBook, SourceSelectionRef } from "../lib/source/types";
import { CurriculumPanel } from "../components/CurriculumPanel";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NESA Exam Builder — AI curriculum-aligned Rwandan exam papers" },
      {
        name: "description",
        content:
          "Design the sections yourself and let AI write curriculum-aligned questions inside a print-ready paper formatted to official NESA standards.",
      },
      { property: "og:title", content: "NESA Exam Builder" },
      {
        property: "og:description",
        content:
          "Generate print-ready NESA-standard exam papers with consistent numbering, marks and answer spaces.",
      },
    ],
  }),
  component: ConfigPage,
});

const LETTERS = "ABCDEFGH";

function defaultName(index: number) {
  return `SECTION ${LETTERS[index] ?? index + 1}`;
}

function ConfigPage() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<ExamBuildConfig>({
    ...DEFAULT_CONFIG,
    sectionPlan: DEFAULT_SECTION_PLAN.map((s) => ({ ...s })),
  });

  /** Uploaded book kept in memory for this form; it lives in the browser store. */
  const [book, setBook] = useState<SourceBook | undefined>();

  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  // Start from the official architecture for the default subject + level.
  useEffect(() => {
    applyProfile({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subject = SUBJECTS.find((s) => s.id === config.subjectId) ?? SUBJECTS[0];
  const profile = useMemo(
    () => formatProfileFor(subject.name, config.level),
    [subject.name, config.level],
  );

  /** Applying the official architecture for this subject + level. */
  const applyProfile = (next: { subjectId?: string; level?: string }) =>
    setConfig((c) => {
      const subjectId = next.subjectId ?? c.subjectId;
      const level = next.level ?? c.level;
      const name = (SUBJECTS.find((s) => s.id === subjectId) ?? SUBJECTS[0]).name;
      const p = formatProfileFor(name, level);
      return {
        ...c,
        subjectId,
        level,
        duration: p.duration,
        totalMarks: p.totalMarks,
        sectionPlan: p.sections.map((x) => ({ ...x })),
        units: [],
      };
    });
  const sections = config.sectionPlan ?? [];
  const total = useMemo(() => planTotalMarks(sections), [sections]);
  const valid = sections.length > 0 && sections.every((s) => s.marks > 0 && s.types.length > 0);

  const setSourceSelection = (ref: SourceSelectionRef | undefined) =>
    setConfig((c) => ({
      ...c,
      // Book questions must be written, so a book implies AI content.
      source: ref ? "ai" : c.source,
      sourceMaterial: ref,
      sectionPlan: (c.sectionPlan ?? []).map((s) => ({
        ...s,
        sourceNodeIds: ref
          ? (s.sourceNodeIds ?? []).filter((id) => ref.nodeIds.includes(id))
          : undefined,
      })),
    }));

  const set = <K extends keyof ExamBuildConfig>(key: K, value: ExamBuildConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }));

  const patchSection = (id: string, patch: Partial<SectionSpec>) =>
    setConfig((c) => ({
      ...c,
      sectionPlan: (c.sectionPlan ?? []).map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));

  const addSection = () =>
    setConfig((c) => {
      const list = c.sectionPlan ?? [];
      return {
        ...c,
        sectionPlan: [
          ...list,
          {
            id: `sec_${Date.now()}`,
            name: `${defaultName(list.length)}: SHORT ANSWER QUESTIONS`,
            marks: 20,
            types: ["short_answer"] as BankType[],
          },
        ],
      };
    });

  const removeSection = (id: string) =>
    setConfig((c) => ({
      ...c,
      sectionPlan: (c.sectionPlan ?? []).filter((s) => s.id !== id),
    }));

  /** The subject's fixed rule for a section, matched by id then by position. */
  const ruleFor = (section: SectionSpec, index: number) =>
    sectionRuleFor(subject.name, levelBand(config.level), section.id, index);

  const toggleType = (section: SectionSpec, index: number, type: BankType) => {
    const rule = ruleFor(section, index);
    // ARCHITECTURE GUARD: a type this section may not contain can never be
    // switched on, and the last remaining allowed type can never be removed.
    if (rule && !rule.allowed.includes(type)) return;
    const has = section.types.includes(type);
    if (has && section.types.length === 1) return;
    const next = has
      ? section.types.filter((t) => t !== type)
      : QUESTION_TYPE_OPTIONS.map((o) => o.type).filter(
          (t) => t === type || section.types.includes(t),
        );
    patchSection(section.id, { types: next });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    navigate({
      to: "/exam/$id",
      params: { id: encodeConfig({ ...config, totalMarks: total }) },
    }).catch(() => setSubmitting(false));
  };

  return (
    <StudioShell
      title="Untitled exam paper"
      subtitle={`${subject.name} · ${config.level} · ${total} marks`}
      stage="plan"
      left={{
        title: "Official format",
        content: (
          <div className="space-y-3">
            <p className="text-[13px] font-semibold text-ink">{profile.sourceLabel}</p>
            <p className="text-[12px] text-subtle">
              {subject.name} at {config.level} · {profile.bandLabel} · {profile.sections.length}{" "}
              sections · {profile.totalMarks} marks · {profile.duration}
            </p>
            <ul className="list-disc space-y-1 pl-4 text-[12px] text-subtle">
              {profile.conventions.slice(0, 5).map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <div className="rounded-[12px] border border-hairline p-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-subtle">
                Your plan
              </p>
              <ul className="mt-2 space-y-1 text-[12px] text-ink">
                {sections.map((s) => (
                  <li key={s.id} className="flex justify-between gap-2">
                    <span className="truncate">{s.name}</span>
                    <span className="font-semibold text-subtle">{s.marks}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[12px] font-bold text-brand">{total} marks total</p>
            </div>
          </div>
        ),
      }}
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Rwanda · NESA standard
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Build a print-ready exam paper
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Design each section yourself — its name, its marks and the question types it contains.
            AI writes curriculum-aligned questions to fit, and every layout decision (numbering,
            indentation, marks placement, answer-line height, page breaks) stays fixed to NESA
            house style.
          </p>
        </header>

        <form onSubmit={submit} className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Paper details
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-foreground">Subject</span>
                <select
                  value={config.subjectId}
                  onChange={(e) => applyProfile({ subjectId: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-foreground">Level</span>
                <select
                  value={config.level}
                  onChange={(e) => applyProfile({ level: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  {LEVEL_OPTIONS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-foreground">Duration</span>
                <select
                  value={config.duration}
                  onChange={(e) => set("duration", e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  {["1 hour", "1 hour 30 minutes", "2 hours", "2 hours 30 minutes", "3 hours"].map(
                    (d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-foreground">Term / period</span>
                <select
                  value={config.term}
                  onChange={(e) => set("term", e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  {["TERM 1", "TERM 2", "TERM 3"].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-foreground">Academic year</span>
                <input
                  value={config.academicYear}
                  onChange={(e) => set("academicYear", e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-foreground">Cognitive emphasis</span>
                <select
                  value={config.cognitive ?? "balanced"}
                  onChange={(e) => set("cognitive", e.target.value as ExamBuildConfig["cognitive"])}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="balanced">Balanced — recall, application, analysis</option>
                  <option value="application">Application-leaning — competence-based</option>
                  <option value="analysis">Analysis-leaning — higher order</option>
                </select>
              </label>
            </div>
          </section>

          <CurriculumPanel
            subjectId={config.subjectId}
            subjectName={subject.name}
            level={config.level}
            selected={config.units ?? []}
            onChange={(units) => set("units", units)}
          />

          <SourceMaterialPanel
            book={book}
            selection={config.sourceMaterial}
            onBook={setBook}
            onSelection={setSourceSelection}
          />


          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Sections
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Name each section, set its marks and pick the question types it must contain.
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                {total} marks total
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">
                Following <span className="font-semibold text-foreground">{profile.sourceLabel}</span>{" "}
                · {profile.bandLabel}
              </p>
              <button
                type="button"
                onClick={() => applyProfile({})}
                className="rounded-md border border-input px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
              >
                Reset to official format
              </button>
            </div>


            <div className="mt-5 space-y-4">
              {sections.map((section, i) => (
                <div
                  key={section.id}
                  className="rounded-lg border border-border bg-background p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md bg-primary px-2 text-xs font-bold text-primary-foreground">
                      {LETTERS[i] ?? i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSection(section.id)}
                      disabled={sections.length === 1}
                      className="text-xs font-medium text-destructive hover:underline disabled:opacity-40"
                    >
                      Remove section
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <label className="block">
                      <span className="text-xs font-medium text-muted-foreground">Section name</span>
                      <input
                        value={section.name}
                        onChange={(e) => patchSection(section.id, { name: e.target.value })}
                        placeholder={`${defaultName(i)}: OBJECTIVE QUESTIONS`}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground"
                      />
                    </label>
                    <label className="block sm:w-28">
                      <span className="text-xs font-medium text-muted-foreground">Marks</span>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={section.marks}
                        onChange={(e) =>
                          patchSection(section.id, { marks: Number(e.target.value) || 0 })
                        }
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                      />
                    </label>
                  </div>

                  <div className="mt-3">
                    <span className="text-xs font-medium text-muted-foreground">Question types</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {QUESTION_TYPE_OPTIONS.map((opt) => {
                        const active = section.types.includes(opt.type);
                        return (
                          <button
                            key={opt.type}
                            type="button"
                            aria-pressed={active}
                            onClick={() => toggleType(section, opt.type)}
                            title={opt.marks}
                            className={
                              active
                                ? "rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
                                : "rounded-full border border-input px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-accent"
                            }
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    {section.types.length === 0 ? (
                      <p className="mt-2 text-xs font-medium text-destructive">
                        Choose at least one question type.
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {instructionsForTypes(section.types)}
                      </p>
                    )}
                  </div>

                  {book && config.sourceMaterial?.nodeIds.length ? (
                    <SectionSourcePicker
                      book={book}
                      sectionId={section.id}
                      availableIds={config.sourceMaterial.nodeIds}
                      value={section.sourceNodeIds ?? []}
                      onChange={(ids) =>
                        patchSection(section.id, { sourceNodeIds: ids.length ? ids : undefined })
                      }
                    />
                  ) : null}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addSection}
              className="mt-4 w-full rounded-md border border-dashed border-input px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              + Add section
            </button>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Question content
            </h2>
            <div className="mt-4 space-y-2">
              {(
                [
                  {
                    key: "ai",
                    label: "AI-written questions",
                    hint: "Fresh curriculum-aligned questions, checked against the NESA item rules before printing.",
                  },
                  {
                    key: "bank",
                    label: "Curated bank",
                    hint: "Instant, offline, hand-checked questions.",
                  },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.key}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50"
                >
                  <input
                    type="radio"
                    name="source"
                    checked={config.source === opt.key}
                    onChange={() => set("source", opt.key)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-medium text-foreground">{opt.label}</span>
                    <span className="block text-xs text-muted-foreground">{opt.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <button
            type="submit"
            disabled={!valid || !ready || submitting}
            aria-busy={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <span
                  aria-hidden
                  className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground"
                />
                Preparing your paper…
              </>
            ) : !ready ? (
              "Loading builder…"
            ) : (
              <>Generate exam paper · {total} marks</>
            )}
          </button>
          {submitting ? (
            <p className="text-center text-xs text-muted-foreground">
              Opening the paper — the AI then writes and checks every question.
            </p>
          ) : null}
        </form>
      </div>
    </StudioShell>
  );
}
