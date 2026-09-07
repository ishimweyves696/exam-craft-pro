import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import type { GeneratedExam, GeneratedMarkingGuide } from '../../types';
import { cloneExam, recalcMarks } from '../../lib/examEdits';
import { aiEditQuestion } from '../../lib/ai/edit.functions';
import { expectedAnswerFor, materialiseQuestion } from '../../lib/aiApply';
import { AiAssistBubble, QuestionSkeleton } from './AiAssistBubble';
import { EditableText } from './EditableText';
import { SYMBOL_GROUPS } from './symbols';
import {
  AnswerSpaceControl,
  AnswerSpacePreview,
  type AnswerSpaceValue,
} from './AnswerSpaceControl';
import { stripMarkers } from '../../lib/richText';

type AnyQuestion = any;

interface Selection {
  section: number;
  question: number | null;
}

const QUESTION_TYPES: { value: string; label: string }[] = [
  { value: 'mcq', label: 'Multiple choice' },
  { value: 'true_false', label: 'True / False' },
  { value: 'fill_blank', label: 'Fill in the blank' },
  { value: 'matching', label: 'Matching' },
  { value: 'short_answer', label: 'Short answer' },
  { value: 'essay', label: 'Essay' },
];

/** A4 width in CSS pixels — the sheet is always 21cm, only the preview scales. */
const SHEET_PX = 793.7;

function blankQuestion(type: string, sectionId: string, index: number): AnyQuestion {
  const id = `${sectionId}_q${index + 1}_${Math.random().toString(36).slice(2, 7)}`;
  const base = { id, number: index + 1, text: 'New question…', marks: 1, type };
  if (type === 'mcq') {
    return {
      ...base,
      answerSpace: 'none',
      options: ['Option A', 'Option B', 'Option C', 'Option D'].map((t, i) => ({
        id: `${id}_o${i + 1}`,
        text: t,
        isCorrect: i === 0,
      })),
    };
  }
  if (type === 'matching') {
    return {
      ...base,
      marks: 3,
      answerSpace: 'none',
      tableData: {
        rows: [
          ['Column A', 'Column B'],
          ['Item 1', 'Match 1'],
          ['Item 2', 'Match 2'],
          ['Item 3', 'Match 3'],
        ],
      },
    };
  }
  if (type === 'essay') return { ...base, marks: 15, answerSpace: 'xlarge' };
  if (type === 'true_false' || type === 'fill_blank') return { ...base, answerSpace: 'none' };
  return { ...base, marks: 3, answerSpace: 'medium' };
}

function spaceValueOf(q: AnyQuestion): AnswerSpaceValue {
  return {
    answerSpace: q?.answerSpace ?? 'none',
    answerStyle: q?.presentation?.answerStyle ?? 'dotted',
    customLines: q?.presentation?.customLines,
  };
}

function applySpaceValue(q: AnyQuestion, next: AnswerSpaceValue) {
  q.answerSpace = next.answerSpace ?? q.answerSpace ?? 'medium';
  q.presentation = { ...(q.presentation ?? {}), answerStyle: next.answerStyle ?? 'dotted' };
  if (typeof next.customLines === 'number') {
    q.presentation.customLines = next.customLines;
    if (next.customLines > 0 && (!q.answerSpace || q.answerSpace === 'none')) q.answerSpace = 'medium';
  } else {
    delete q.presentation.customLines;
  }
}

export function ExamEditor({
  exam: initialExam,
  markingGuide: initialGuide,
  onSave,
  onRevert,
  savedAt,
}: {
  exam: GeneratedExam;
  markingGuide: GeneratedMarkingGuide;
  onSave: (exam: GeneratedExam, guide: GeneratedMarkingGuide) => void;
  onRevert: () => void;
  savedAt?: string;
}) {
  const [exam, setExam] = useState<GeneratedExam>(() => cloneExam(initialExam));
  const [guide, setGuide] = useState<GeneratedMarkingGuide>(() => cloneExam(initialGuide));
  const [past, setPast] = useState<{ exam: GeneratedExam; guide: GeneratedMarkingGuide }[]>([]);
  const [future, setFuture] = useState<{ exam: GeneratedExam; guide: GeneratedMarkingGuide }[]>([]);
  const [dirty, setDirty] = useState(false);
  const [zoom, setZoom] = useState<number | 'fit'>('fit');
  const [sel, setSel] = useState<Selection>({ section: 0, question: null });
  const [sheet, setSheet] = useState<null | 'outline' | 'inspector' | 'symbols'>(null);
  const lastField = useRef<HTMLElement | null>(null);

  /* ---------- fit the A4 sheet to whatever screen the teacher is on ---------- */
  const canvasRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(1);
  const [sheetHeight, setSheetHeight] = useState(1122);

  useLayoutEffect(() => {
    const measure = () => {
      const el = canvasRef.current;
      if (el) {
        const pad = window.innerWidth < 640 ? 16 : 48;
        setFitScale(Math.min(1.4, Math.max(0.25, (el.clientWidth - pad) / SHEET_PX)));
      }
      if (sheetRef.current) setSheetHeight(sheetRef.current.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (canvasRef.current) ro.observe(canvasRef.current);
    if (sheetRef.current) ro.observe(sheetRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const scale = zoom === 'fit' ? fitScale : zoom;

  const commit = useCallback(
    (mutate: (draft: GeneratedExam, draftGuide: GeneratedMarkingGuide) => void) => {
      setPast((p) => [...p.slice(-49), { exam: cloneExam(exam), guide: cloneExam(guide) }]);
      setFuture([]);
      const nextExam = cloneExam(exam);
      const nextGuide = cloneExam(guide);
      mutate(nextExam, nextGuide);
      recalcMarks(nextExam);
      setExam(nextExam);
      setGuide(nextGuide);
      setDirty(true);
    },
    [exam, guide],
  );

  const undo = () => {
    setPast((p) => {
      if (!p.length) return p;
      const prev = p[p.length - 1];
      setFuture((f) => [{ exam: cloneExam(exam), guide: cloneExam(guide) }, ...f]);
      setExam(prev.exam);
      setGuide(prev.guide);
      setDirty(true);
      return p.slice(0, -1);
    });
  };

  const redo = () => {
    setFuture((f) => {
      if (!f.length) return f;
      const next = f[0];
      setPast((p) => [...p, { exam: cloneExam(exam), guide: cloneExam(guide) }]);
      setExam(next.exam);
      setGuide(next.guide);
      setDirty(true);
      return f.slice(1);
    });
  };

  const save = () => {
    onSave(cloneExam(exam), cloneExam(guide));
    setDirty(false);
  };

  // Familiar document shortcuts: save, undo, redo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const k = e.key.toLowerCase();
      if (k === 's') {
        e.preventDefault();
        save();
      } else if (k === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (k === 'y' || (k === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const selectedQuestion: AnyQuestion | undefined =
    sel.question !== null ? (exam.sections[sel.section]?.questions[sel.question] as AnyQuestion) : undefined;

  /* ---------- AI assist: rewrite the selected question only ---------- */
  const askAi = useServerFn(aiEditQuestion);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiTargetId, setAiTargetId] = useState<string | undefined>(undefined);
  const [aiError, setAiError] = useState<string | undefined>(undefined);
  const [aiNote, setAiNote] = useState<string | undefined>(undefined);

  const runAiEdit = useCallback(
    async (instruction: string) => {
      const si = sel.section;
      const qi = sel.question;
      const target = qi !== null ? (exam.sections[si]?.questions[qi] as AnyQuestion) : undefined;
      if (!target || qi === null || aiBusy) return;

      setAiBusy(true);
      setAiTargetId(target.id);
      setAiError(undefined);
      setAiNote(undefined);
      try {
        const res = await askAi({
          data: {
            instruction,
            question: JSON.stringify(target),
            subject: exam.header.subjectName ?? '',
            level: exam.header.level ?? '',
            term: (exam.header as any).term ?? '',
            section: exam.sections[si]?.title ?? '',
          },
        });
        if (!res.questions?.length) throw new Error('The assistant returned no question.');

        commit((d, g) => {
          const sec = d.sections[si] as any;
          const sectionId = sec?.id ?? `sec${si + 1}`;
          const replacements = res.questions.map((ai, i) =>
            materialiseQuestion(ai, sectionId, qi + i),
          );
          sec.questions.splice(qi, 1, ...replacements);
          sec.questions.forEach((x: AnyQuestion, i: number) => (x.number = i + 1));

          // Keep the marking guide in step with the rewritten question.
          const gs = g.sections[si] ?? g.sections[0];
          if (gs) {
            gs.answers = gs.answers.filter((a) => a.questionId !== target.id);
            replacements.forEach((q, i) => {
              gs.answers.push({
                questionId: q.id,
                number: q.number,
                expected: expectedAnswerFor(res.questions[i]),
                marks: q.marks,
              } as any);
            });
            gs.answers.sort((a: any, b: any) => (a.number ?? 0) - (b.number ?? 0));
          }
        });
        setSel({ section: si, question: qi });
        setAiNote(res.note ?? 'Question updated.');
      } catch (err) {
        setAiError(err instanceof Error ? err.message : 'The AI edit could not be completed.');
      } finally {
        setAiBusy(false);
        setAiTargetId(undefined);
      }
    },
    [askAi, aiBusy, commit, exam, sel.section, sel.question],
  );

  /* ---------- formatting applied to whatever field has the caret ---------- */
  const applyFormat = (command: string) => {
    const el = lastField.current;
    if (!el) return;
    el.focus();
    document.execCommand(command);
  };

  const insertSymbol = (symbol: string) => {
    const el = lastField.current;
    if (!el) return;
    el.focus();
    document.execCommand('insertText', false, symbol);
  };

  const guideAnswer = (questionId: string) =>
    guide.sections.flatMap((s) => s.answers).find((a) => a.questionId === questionId);

  const setGuideAnswer = (sectionIndex: number, q: AnyQuestion, expected: string) =>
    commit((_d, g) => {
      const target = g.sections[sectionIndex] ?? g.sections[0];
      if (!target) return;
      const existing = target.answers.find((a) => a.questionId === q.id);
      if (existing) existing.expected = expected;
      else target.answers.push({ questionId: q.id, number: q.number, expected, marks: q.marks });
    });

  const totalMarks = useMemo(
    () => exam.sections.reduce((s, sec) => s + sec.marks, 0),
    [exam.sections],
  );

  /* ---------------- outline panel (shared: sidebar + phone sheet) ---------------- */
  const outline = (
    <div>
      {exam.sections.map((section, si) => (
        <div key={section.id ?? si} className="mb-3">
          <button
            onClick={() => {
              setSel({ section: si, question: null });
              setSheet(null);
            }}
            className={`w-full truncate rounded px-2 py-1.5 text-left text-xs font-semibold ${
              sel.section === si && sel.question === null
                ? 'bg-primary/10 text-primary'
                : 'text-foreground hover:bg-accent'
            }`}
          >
            {section.title || `Section ${si + 1}`}
          </button>
          <ul className="mt-1 space-y-0.5">
            {section.questions.map((q, qi) => (
              <li key={q.id}>
                <button
                  onClick={() => {
                    setSel({ section: si, question: qi });
                    setSheet(null);
                  }}
                  className={`w-full truncate rounded px-2 py-1.5 text-left text-[12px] ${
                    sel.section === si && sel.question === qi
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {qi + 1}. {stripMarkers(q.text)?.slice(0, 34) || 'Untitled'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <button
        onClick={() =>
          commit((d) => {
            const id = `sec_${d.sections.length + 1}`;
            d.sections.push({
              id,
              name: `SECTION ${String.fromCharCode(65 + d.sections.length)}`,
              title: `SECTION ${String.fromCharCode(65 + d.sections.length)}`,
              instructions: 'Attempt ALL questions.',
              marks: 0,
              attemptRule: { mode: 'all' },
              questions: [],
              presentation: { pageBreakBefore: true, columns: 1 },
            } as any);
          })
        }
        className="mt-2 w-full rounded-md border border-dashed border-border px-2 py-2 text-xs text-muted-foreground hover:bg-accent"
      >
        + Add section
      </button>
    </div>
  );

  /* ---------------- inspector panel (shared: sidebar + phone sheet) ---------------- */
  const inspector = selectedQuestion ? (
    <div className="space-y-3">
      <Field label="Question type">
        <select
          value={selectedQuestion.type}
          onChange={(e) =>
            commit((d) => {
              const q = d.sections[sel.section].questions[sel.question!] as AnyQuestion;
              q.type = e.target.value;
              if (e.target.value === 'mcq' && !q.options?.length) {
                q.options = ['Option A', 'Option B', 'Option C', 'Option D'].map((t, i) => ({
                  id: `${q.id}_o${i + 1}`,
                  text: t,
                  isCorrect: i === 0,
                }));
              }
              if (e.target.value === 'essay') q.answerSpace = 'xlarge';
            })
          }
          className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
        >
          {QUESTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </Field>

      <Field label="Marks">
        <input
          type="number"
          min={0}
          value={selectedQuestion.marks}
          onChange={(e) =>
            commit((d) => {
              (d.sections[sel.section].questions[sel.question!] as AnyQuestion).marks =
                Math.max(0, Number(e.target.value) || 0);
            })
          }
          className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
        />
      </Field>

      <Field label="Answer space">
        <AnswerSpaceControl
          value={spaceValueOf(selectedQuestion)}
          marks={selectedQuestion.marks}
          onChange={(next) =>
            commit((d) =>
              applySpaceValue(d.sections[sel.section].questions[sel.question!] as AnyQuestion, next),
            )
          }
        />
      </Field>

      {String(selectedQuestion.type ?? '').toLowerCase().includes('match') && (
        <Field label="Matching layout">
          <select
            value={
              (selectedQuestion as AnyQuestion).layoutVariant ??
              selectedQuestion.presentation?.layout ??
              'auto'
            }
            onChange={(e) =>
              commit((d) => {
                const q = d.sections[sel.section].questions[sel.question!] as AnyQuestion;
                const v = e.target.value;
                if (v === 'auto') {
                  delete q.layoutVariant;
                  if (q.presentation) delete q.presentation.layout;
                } else {
                  q.layoutVariant = v;
                  q.presentation = { ...(q.presentation ?? {}), layout: v };
                }
              })
            }
            className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
          >
            <option value="auto">Automatic</option>
            <option value="table">With table</option>
            <option value="traditional">Without table (two columns)</option>
            <option value="response-column">Without table + answer column</option>
          </select>
        </Field>
      )}

      {String(selectedQuestion.type ?? '').toLowerCase().replace(/[-\s]/g, '_').includes('true_false') && (
        <Field label="True / False answering space">
          <select
            value={selectedQuestion.presentation?.trueFalseStyle ?? 'auto'}
            onChange={(e) =>
              commit((d) => {
                const q = d.sections[sel.section].questions[sel.question!] as AnyQuestion;
                const v = e.target.value;
                if (v === 'auto') {
                  if (q.presentation) delete q.presentation.trueFalseStyle;
                } else {
                  q.presentation = { ...(q.presentation ?? {}), trueFalseStyle: v };
                }
              })
            }
            className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
          >
            <option value="auto">Automatic</option>
            <option value="dotted">Dotted line</option>
            <option value="box">Box at end of line</option>
          </select>
        </Field>
      )}

      <label className="flex items-center gap-2 text-xs text-foreground">
        <input
          type="checkbox"
          checked={Boolean(selectedQuestion.presentation?.pageBreakBefore)}
          onChange={(e) =>
            commit((d) => {
              const q = d.sections[sel.section].questions[sel.question!] as AnyQuestion;
              q.presentation = { ...(q.presentation ?? {}), pageBreakBefore: e.target.checked };
            })
          }
        />
        Start on a new page
      </label>

      <Field label="Expected answer (marking guide)">
        <textarea
          rows={3}
          defaultValue={guideAnswer(selectedQuestion.id)?.expected ?? ''}
          key={selectedQuestion.id}
          onBlur={(e) => setGuideAnswer(sel.section, selectedQuestion, e.target.value)}
          className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
        />
      </Field>

      <div className="flex gap-2">
        <button
          onClick={() =>
            commit((d) => {
              const sec = d.sections[sel.section];
              const copy = cloneExam(sec.questions[sel.question!]) as AnyQuestion;
              copy.id = `${copy.id}_copy_${Math.random().toString(36).slice(2, 6)}`;
              sec.questions.splice(sel.question! + 1, 0, copy);
              sec.questions.forEach((qq, i) => ((qq as any).number = i + 1));
            })
          }
          className="flex-1 rounded-md border border-input px-2 py-2 text-xs hover:bg-accent"
        >
          Duplicate
        </button>
        <button
          onClick={() => {
            commit((d) => {
              const sec = d.sections[sel.section];
              sec.questions.splice(sel.question!, 1);
              sec.questions.forEach((qq, i) => ((qq as any).number = i + 1));
            });
            setSel((s) => ({ ...s, question: null }));
          }}
          className="flex-1 rounded-md border border-destructive/40 px-2 py-2 text-xs text-destructive hover:bg-destructive/10"
        >
          Delete
        </button>
      </div>
    </div>
  ) : (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Tap any question on the paper to edit its type, marks, answer space and marking-guide
        answer. Every word on the sheet is directly editable — tap and type.
      </p>
      {exam.sections[sel.section] && (
        <>
          <Field label="Section title">
            <input
              key={`title-${sel.section}`}
              defaultValue={exam.sections[sel.section].title ?? ''}
              onBlur={(e) =>
                commit((d) => {
                  d.sections[sel.section].title = e.target.value;
                  (d.sections[sel.section] as any).name = e.target.value;
                })
              }
              className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
            />
          </Field>
          <Field label="Section instructions">
            <textarea
              rows={2}
              key={`inst-${sel.section}`}
              defaultValue={exam.sections[sel.section].instructions ?? ''}
              onBlur={(e) =>
                commit((d) => void (d.sections[sel.section].instructions = e.target.value))
              }
              className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
            />
          </Field>
          <Field label="Columns on the page">
            <select
              value={(exam.sections[sel.section] as any).presentation?.columns ?? 1}
              onChange={(e) =>
                commit((d) => {
                  const s = d.sections[sel.section] as any;
                  s.presentation = { ...(s.presentation ?? {}), columns: Number(e.target.value) };
                })
              }
              className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
            >
              <option value={1}>Single column</option>
              <option value={2}>Two columns</option>
            </select>
          </Field>
          <label className="flex items-center gap-2 text-xs text-foreground">
            <input
              type="checkbox"
              checked={Boolean((exam.sections[sel.section] as any).presentation?.pageBreakBefore)}
              onChange={(e) =>
                commit((d) => {
                  const s = d.sections[sel.section] as any;
                  s.presentation = { ...(s.presentation ?? {}), pageBreakBefore: e.target.checked };
                })
              }
            />
            Start this section on a new page
          </label>
        </>
      )}
    </div>
  );

  /* ---------------- symbol palette (shared) ---------------- */
  const symbols = (
    <div>
      {SYMBOL_GROUPS.map((group) => (
        <div key={group.label} className="mb-3">
          <p className="mb-1 text-[10px] uppercase text-muted-foreground">{group.label}</p>
          <div className="flex flex-wrap gap-1">
            {group.symbols.map((s) => (
              <button
                key={s}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertSymbol(s)}
                className="min-w-9 rounded border border-border px-2 py-1.5 text-sm hover:bg-accent"
                title={`Insert ${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ))}
      <p className="text-[10px] text-muted-foreground">
        Tap into any text on the paper first, then pick a symbol to drop it at the cursor.
      </p>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-muted/40">
      <EditorStyles />

      {/* Toolbar */}
      <div className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="flex items-center gap-1 overflow-x-auto px-2 py-1.5">
          <span className="hidden text-sm font-semibold text-foreground sm:inline">Paper editor</span>
          <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
            {totalMarks} marks · {exam.sections.length} sections
          </span>

          <div className="flex shrink-0 items-center gap-0.5">
            <ToolButton onClick={undo} disabled={!past.length} label="Undo">↶</ToolButton>
            <ToolButton onClick={redo} disabled={!future.length} label="Redo">↷</ToolButton>
          </div>

          <div className="flex shrink-0 items-center gap-0.5 rounded-md border border-border px-1">
            <ToolButton
              onClick={() => setZoom(Math.max(0.3, +((scale - 0.1)).toFixed(2)))}
              label="Zoom out"
            >
              −
            </ToolButton>
            <span className="w-10 text-center text-[11px] tabular-nums text-muted-foreground">
              {Math.round(scale * 100)}%
            </span>
            <ToolButton
              onClick={() => setZoom(Math.min(2, +((scale + 0.1)).toFixed(2)))}
              label="Zoom in"
            >
              +
            </ToolButton>
            <button
              onClick={() => setZoom('fit')}
              className={`rounded px-2 py-1 text-[11px] ${
                zoom === 'fit' ? 'bg-primary/10 font-semibold text-primary' : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              Fit
            </button>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {savedAt && !dirty && (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Saved {new Date(savedAt).toLocaleTimeString()}
              </span>
            )}
            {dirty && <span className="text-[11px] font-medium text-amber-600">Unsaved</span>}
            <button
              onClick={onRevert}
              className="hidden rounded-md border border-input px-3 py-1.5 text-sm text-foreground hover:bg-accent sm:block"
            >
              Revert
            </button>
            <button
              onClick={save}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        </div>

        {/* Formatting bar — applies to the text the teacher is typing in */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-border px-2 py-1">
          <span className="shrink-0 pr-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            Format
          </span>
          <FormatButton onClick={() => applyFormat('bold')} label="Bold (Ctrl+B)">
            <b>B</b>
          </FormatButton>
          <FormatButton onClick={() => applyFormat('italic')} label="Italic (Ctrl+I)">
            <i>I</i>
          </FormatButton>
          <FormatButton onClick={() => applyFormat('underline')} label="Underline (Ctrl+U)">
            <u>U</u>
          </FormatButton>
          <FormatButton onClick={() => applyFormat('superscript')} label="Superscript">
            x²
          </FormatButton>
          <FormatButton onClick={() => applyFormat('subscript')} label="Subscript">
            x₂
          </FormatButton>
          <FormatButton onClick={() => applyFormat('removeFormat')} label="Clear formatting">
            ⌫
          </FormatButton>
          <button
            onClick={() => setSheet('symbols')}
            className="ml-1 shrink-0 rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-accent xl:hidden"
          >
            Symbols
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Outline */}
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-border bg-background p-3 lg:block">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Structure
          </p>
          {outline}
        </aside>

        {/* Canvas */}
        <main ref={canvasRef} className="min-w-0 flex-1 overflow-auto p-2 pb-24 sm:p-6 lg:pb-6">
          <div
            style={{
              width: `${SHEET_PX * scale}px`,
              height: `${sheetHeight * scale}px`,
              margin: '0 auto',
            }}
          >
            <div
              ref={sheetRef}
              className="examedit-sheet bg-white"
              style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: '21cm' }}
            >
              {/* Header */}
              <section className="examedit-block" onClick={() => setSel({ section: 0, question: null })}>
                <div className="grid gap-2 text-center">
                  <EditableText
                    className="text-lg font-bold uppercase tracking-wide"
                    value={exam.header.subjectName}
                    multiline={false}
                    placeholder="Subject"
                    onFocus={(el) => (lastField.current = el)}
                    onChange={(v) => commit((d) => void (d.header.subjectName = v))}
                  />
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-700">
                    <HeaderField label="Code" value={exam.header.subjectCode} onFocus={lastField}
                      onChange={(v) => commit((d) => void (d.header.subjectCode = v))} />
                    <HeaderField label="Level" value={exam.header.level} onFocus={lastField}
                      onChange={(v) => commit((d) => void (d.header.level = v))} />
                    <HeaderField label="Duration" value={exam.header.duration} onFocus={lastField}
                      onChange={(v) => commit((d) => void (d.header.duration = v))} />
                    <HeaderField label="Date" value={exam.header.examDate ?? ''} onFocus={lastField}
                      onChange={(v) => commit((d) => void ((d.header as any).examDate = v))} />
                    <HeaderField label="Year" value={exam.header.academicYear ?? ''} onFocus={lastField}
                      onChange={(v) => commit((d) => void ((d.header as any).academicYear = v))} />
                    <span className="font-semibold">Total: {totalMarks} marks</span>
                  </div>
                </div>

                <div className="mt-4 rounded border border-slate-200 p-3">
                  <p className="mb-1 text-xs font-bold uppercase text-slate-700">
                    Instructions to candidates
                  </p>
                  <ol className="list-decimal space-y-1 pl-5 text-xs text-slate-800">
                    {(exam.header.instructions ?? []).map((inst, i) => (
                      <li key={i} className="group flex items-start gap-2">
                        <EditableText
                          className="flex-1"
                          value={inst}
                          rich
                          placeholder="Instruction"
                          onFocus={(el) => (lastField.current = el)}
                          onChange={(v) =>
                            commit((d) => void ((d.header.instructions as string[])[i] = v))
                          }
                        />
                        <MiniButton
                          label="Remove instruction"
                          onClick={() =>
                            commit((d) => void (d.header.instructions as string[]).splice(i, 1))
                          }
                        >
                          ✕
                        </MiniButton>
                      </li>
                    ))}
                  </ol>
                  <MiniButton
                    label="Add instruction"
                    onClick={() =>
                      commit((d) => {
                        d.header.instructions = [...(d.header.instructions ?? []), 'New instruction'];
                      })
                    }
                  >
                    + Add instruction
                  </MiniButton>
                </div>
              </section>

              {/* Sections */}
              {exam.sections.map((section, si) => (
                <section
                  key={section.id ?? si}
                  className={`examedit-block ${sel.section === si && sel.question === null ? 'examedit-selected' : ''}`}
                  onClick={() => setSel({ section: si, question: null })}
                >
                  <div className="flex items-baseline gap-2 border-b-2 border-slate-800 pb-1">
                    <EditableText
                      className="text-sm font-bold uppercase"
                      value={section.title}
                      multiline={false}
                      placeholder="Section title"
                      onFocus={(el) => (lastField.current = el)}
                      onChange={(v) =>
                        commit((d) => {
                          d.sections[si].title = v;
                          (d.sections[si] as any).name = v;
                        })
                      }
                    />
                    <span className="ml-auto text-xs font-semibold">({section.marks} marks)</span>
                    <MiniButton
                      label="Delete section"
                      onClick={() => {
                        commit((d) => void d.sections.splice(si, 1));
                        setSel({ section: 0, question: null });
                      }}
                    >
                      ✕
                    </MiniButton>
                  </div>
                  <EditableText
                    className="mt-1 block text-xs italic text-slate-700"
                    value={section.instructions}
                    rich
                    placeholder="Section instructions"
                    onFocus={(el) => (lastField.current = el)}
                    onChange={(v) => commit((d) => void (d.sections[si].instructions = v))}
                  />

                  <div className="mt-3 space-y-4">
                    {section.questions.map((q: AnyQuestion, qi) =>
                      aiTargetId === q.id && aiBusy ? (
                        <QuestionSkeleton key={q.id} label={`AI is rewriting question ${qi + 1}…`} />
                      ) : (
                        <QuestionCard
                          key={q.id}
                          q={q}
                          index={qi}
                          selected={sel.section === si && sel.question === qi}
                          onSelect={() => setSel({ section: si, question: qi })}
                          lastField={lastField}
                          commit={commit}
                          si={si}
                          qi={qi}
                          count={section.questions.length}
                        />
                      ),
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5 border-t border-dashed border-slate-300 pt-2">
                    <span className="text-[11px] text-slate-500">Add question:</span>
                    {QUESTION_TYPES.map((t) => (
                      <MiniButton
                        key={t.value}
                        label={`Add ${t.label}`}
                        onClick={() =>
                          commit((d) => {
                            const sec = d.sections[si];
                            sec.questions.push(
                              blankQuestion(t.value, sec.id ?? `sec_${si + 1}`, sec.questions.length),
                            );
                            sec.questions.forEach((qq, i) => ((qq as any).number = i + 1));
                          })
                        }
                      >
                        + {t.label}
                      </MiniButton>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </main>

        {/* Inspector */}
        <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-border bg-background p-3 xl:block">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {selectedQuestion ? `Question ${sel.question! + 1}` : 'Section properties'}
          </p>
          {inspector}
          <div className="mt-5 border-t border-border pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Insert symbol
            </p>
            {symbols}
          </div>
        </aside>
      </div>

      {/* Phone / tablet bar: everything the side panels hold, one tap away */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-1 border-t border-border bg-background/95 px-2 py-1.5 backdrop-blur xl:hidden">
        <BarButton onClick={() => setSheet('outline')} label="Structure" />
        <BarButton
          onClick={() => setSheet('inspector')}
          label={selectedQuestion ? `Question ${sel.question! + 1}` : 'Section'}
        />
        <BarButton onClick={() => setSheet('symbols')} label="Symbols" />
        <button
          onClick={onRevert}
          className="shrink-0 rounded-md border border-input px-3 py-2 text-xs text-foreground sm:hidden"
        >
          Revert
        </button>
      </nav>

      <MobileSheet
        open={sheet !== null}
        title={
          sheet === 'outline'
            ? 'Structure'
            : sheet === 'symbols'
              ? 'Insert symbol'
              : selectedQuestion
                ? `Question ${sel.question! + 1}`
                : 'Section properties'
        }
        onClose={() => setSheet(null)}
      >
        {sheet === 'outline' ? outline : sheet === 'symbols' ? symbols : inspector}
      </MobileSheet>

      <AiAssistBubble
        hasTarget={Boolean(selectedQuestion)}
        targetLabel={
          selectedQuestion
            ? `Question ${selectedQuestion.number ?? (sel.question ?? 0) + 1} · ${
                exam.sections[sel.section]?.title ?? ''
              }`
            : ''
        }
        busy={aiBusy}
        error={aiError}
        note={aiNote}
        onSubmit={runAiEdit}
        onDismissMessage={() => {
          setAiError(undefined);
          setAiNote(undefined);
        }}
      />
    </div>
  );
}

/* ---------------- question card ---------------- */

function QuestionCard({
  q,
  index,
  selected,
  onSelect,
  lastField,
  commit,
  si,
  qi,
  count,
}: {
  q: AnyQuestion;
  index: number;
  selected: boolean;
  onSelect: () => void;
  lastField: React.MutableRefObject<HTMLElement | null>;
  commit: (m: (d: GeneratedExam, g: GeneratedMarkingGuide) => void) => void;
  si: number;
  qi: number;
  count: number;
}) {
  const at = (d: GeneratedExam) => d.sections[si].questions[qi] as AnyQuestion;
  const table = q.tableData;

  return (
    <div
      className={`examedit-question group/q ${selected ? 'examedit-selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 w-6 shrink-0 text-sm font-bold">{index + 1}.</span>
        <EditableText
          className="min-w-0 flex-1 text-sm"
          value={q.text}
          rich
          placeholder="Question text"
          onFocus={(el) => (lastField.current = el)}
          onChange={(v) => commit((d) => void (at(d).text = v))}
        />
        <span className="shrink-0 text-xs font-semibold text-slate-600">
          ({q.marks} {q.marks === 1 ? 'mark' : 'marks'})
        </span>

        <div className="flex shrink-0 flex-col gap-0.5">
          <MiniButton
            label="Move up"
            disabled={qi === 0}
            onClick={() =>
              commit((d) => {
                const qs = d.sections[si].questions;
                [qs[qi - 1], qs[qi]] = [qs[qi], qs[qi - 1]];
                qs.forEach((x, i) => ((x as any).number = i + 1));
              })
            }
          >
            ↑
          </MiniButton>
          <MiniButton
            label="Move down"
            disabled={qi === count - 1}
            onClick={() =>
              commit((d) => {
                const qs = d.sections[si].questions;
                [qs[qi + 1], qs[qi]] = [qs[qi], qs[qi + 1]];
                qs.forEach((x, i) => ((x as any).number = i + 1));
              })
            }
          >
            ↓
          </MiniButton>
        </div>
      </div>

      {/* MCQ options */}
      {Array.isArray(q.options) && q.options.length > 0 && (
        <div className="mt-2 grid gap-1 pl-8 sm:grid-cols-2">
          {q.options.map((opt: any, oi: number) => (
            <div key={opt.id ?? oi} className="group flex items-start gap-1.5 text-sm">
              <input
                type="radio"
                name={`${q.id}_correct`}
                checked={Boolean(opt.isCorrect)}
                onChange={() =>
                  commit((d) =>
                    at(d).options.forEach((o: any, i: number) => (o.isCorrect = i === oi)),
                  )
                }
                title="Mark as the correct answer"
                className="mt-1"
              />
              <span className="font-semibold">{'abcdef'[oi]})</span>
              <EditableText
                className="min-w-0 flex-1"
                value={opt.text}
                rich
                multiline={false}
                placeholder="Option"
                onFocus={(el) => (lastField.current = el)}
                onChange={(v) => commit((d) => void (at(d).options[oi].text = v))}
              />
              <MiniButton
                label="Remove option"
                onClick={() => commit((d) => void at(d).options.splice(oi, 1))}
              >
                ✕
              </MiniButton>
            </div>
          ))}
          <MiniButton
            label="Add option"
            onClick={() =>
              commit((d) => {
                const target = at(d);
                target.options.push({
                  id: `${target.id}_o${target.options.length + 1}`,
                  text: 'New option',
                  isCorrect: false,
                });
              })
            }
          >
            + Add option
          </MiniButton>
        </div>
      )}

      {/* Table / matching grid */}
      {table?.rows?.length > 0 && (
        <div className="mt-2 overflow-x-auto pl-8">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {table.rows.map((row: string[], ri: number) => (
                <tr key={ri}>
                  {row.map((cell: string, ci: number) => (
                    <td key={ci} className="border border-slate-400 px-2 py-1 align-top">
                      <EditableText
                        className={ri === 0 ? 'font-semibold' : ''}
                        value={cell}
                        rich
                        placeholder="Cell"
                        onFocus={(el) => (lastField.current = el)}
                        onChange={(v) => commit((d) => void (at(d).tableData.rows[ri][ci] = v))}
                      />
                    </td>
                  ))}
                  <td className="w-6 border-none pl-1">
                    <MiniButton
                      label="Delete row"
                      onClick={() => commit((d) => void at(d).tableData.rows.splice(ri, 1))}
                    >
                      ✕
                    </MiniButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-1 flex gap-1.5">
            <MiniButton
              label="Add row"
              onClick={() =>
                commit((d) => {
                  const t = at(d).tableData;
                  t.rows.push(new Array(t.rows[0]?.length || 2).fill(''));
                })
              }
            >
              + Row
            </MiniButton>
            <MiniButton
              label="Add column"
              onClick={() =>
                commit((d) => {
                  const t = at(d).tableData;
                  t.rows.forEach((r: string[]) => r.push(''));
                })
              }
            >
              + Column
            </MiniButton>
            <MiniButton
              label="Delete last column"
              onClick={() =>
                commit((d) => {
                  const t = at(d).tableData;
                  if ((t.rows[0]?.length || 0) > 1) t.rows.forEach((r: string[]) => r.pop());
                })
              }
            >
              − Column
            </MiniButton>
          </div>
        </div>
      )}

      {/* Sub-questions */}
      {Array.isArray(q.subQuestions) && q.subQuestions.length > 0 && (
        <div className="mt-2 space-y-1.5 pl-8">
          {q.subQuestions.map((sub: AnyQuestion, sii: number) => (
            <div key={sub.id ?? sii}>
              <div className="flex items-start gap-2 text-sm">
                <span className="w-6 shrink-0 font-semibold">{'abcdefgh'[sii]})</span>
                <EditableText
                  className="min-w-0 flex-1"
                  value={sub.text}
                  rich
                  placeholder="Part text"
                  onFocus={(el) => (lastField.current = el)}
                  onChange={(v) => commit((d) => void (at(d).subQuestions[sii].text = v))}
                />
                <input
                  type="number"
                  min={0}
                  value={sub.marks}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    commit((d) => {
                      at(d).subQuestions[sii].marks = Math.max(0, Number(e.target.value) || 0);
                    })
                  }
                  className="w-14 rounded border border-slate-300 px-1 py-0.5 text-xs"
                />
                <MiniButton
                  label="Remove part"
                  onClick={() => commit((d) => void at(d).subQuestions.splice(sii, 1))}
                >
                  ✕
                </MiniButton>
              </div>

              <AnswerSpacePreview value={spaceValueOf(sub)} marks={sub.marks} />
              {selected && (
                <div className="examedit-space-editor">
                  <AnswerSpaceControl
                    compact
                    value={spaceValueOf(sub)}
                    marks={sub.marks}
                    onChange={(next) =>
                      commit((d) => applySpaceValue(at(d).subQuestions[sii], next))
                    }
                  />
                </div>
              )}

              {Array.isArray(sub.subQuestions) && sub.subQuestions.length > 0 && (
                <div className="mt-1 space-y-1 pl-8">
                  {sub.subQuestions.map((ss: AnyQuestion, ssi: number) => (
                    <div key={ss.id ?? ssi}>
                      <div className="flex items-start gap-2 text-sm">
                        <span className="w-6 shrink-0">{['i', 'ii', 'iii', 'iv', 'v'][ssi]})</span>
                        <EditableText
                          className="min-w-0 flex-1"
                          value={ss.text}
                          rich
                          placeholder="Sub-part text"
                          onFocus={(el) => (lastField.current = el)}
                          onChange={(v) =>
                            commit((d) => void (at(d).subQuestions[sii].subQuestions[ssi].text = v))
                          }
                        />
                        <input
                          type="number"
                          min={0}
                          value={ss.marks ?? 0}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            commit((d) => {
                              at(d).subQuestions[sii].subQuestions[ssi].marks = Math.max(
                                0,
                                Number(e.target.value) || 0,
                              );
                            })
                          }
                          className="w-14 rounded border border-slate-300 px-1 py-0.5 text-xs"
                        />
                        <MiniButton
                          label="Remove sub-part"
                          onClick={() =>
                            commit((d) => void at(d).subQuestions[sii].subQuestions.splice(ssi, 1))
                          }
                        >
                          ✕
                        </MiniButton>
                      </div>
                      <AnswerSpacePreview value={spaceValueOf(ss)} marks={ss.marks} />
                      {selected && (
                        <div className="examedit-space-editor">
                          <AnswerSpaceControl
                            compact
                            value={spaceValueOf(ss)}
                            marks={ss.marks}
                            onChange={(next) =>
                              commit((d) =>
                                applySpaceValue(at(d).subQuestions[sii].subQuestions[ssi], next),
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <MiniButton
            label="Add part"
            onClick={() =>
              commit((d) => {
                const target = at(d);
                target.subQuestions.push({
                  id: `${target.id}_sub${target.subQuestions.length + 1}`,
                  number: target.subQuestions.length + 1,
                  text: 'New part…',
                  marks: 2,
                  type: 'short_answer',
                  answerSpace: 'small',
                });
              })
            }
          >
            + Add part
          </MiniButton>
        </div>
      )}

      {/* Answer space for the question itself */}
      <div className="pl-8">
        <AnswerSpacePreview value={spaceValueOf(q)} marks={q.marks} />
        {selected && (
          <div className="examedit-space-editor">
            <AnswerSpaceControl
              value={spaceValueOf(q)}
              marks={q.marks}
              onChange={(next) => commit((d) => applySpaceValue(at(d), next))}
            />
          </div>
        )}
      </div>

      {/* Insert blocks into this question */}
      <div className="examedit-inserts mt-2 flex flex-wrap gap-1.5 pl-8">
        {!q.options?.length && (
          <MiniButton
            label="Add answer options"
            onClick={() =>
              commit((d) => {
                at(d).options = ['Option A', 'Option B', 'Option C', 'Option D'].map((t, i) => ({
                  id: `${q.id}_o${i + 1}`,
                  text: t,
                  isCorrect: i === 0,
                }));
              })
            }
          >
            + Options
          </MiniButton>
        )}
        {!table?.rows?.length && (
          <MiniButton
            label="Add a table"
            onClick={() =>
              commit((d) => {
                at(d).tableData = {
                  rows: [
                    ['Column A', 'Column B'],
                    ['', ''],
                    ['', ''],
                  ],
                };
              })
            }
          >
            + Table
          </MiniButton>
        )}
        {table?.rows?.length > 0 && (
          <MiniButton label="Remove table" onClick={() => commit((d) => void delete at(d).tableData)}>
            − Table
          </MiniButton>
        )}
        {!q.subQuestions?.length && (
          <MiniButton
            label="Add sub-parts"
            onClick={() =>
              commit((d) => {
                const target = at(d);
                target.subQuestions = [
                  {
                    id: `${target.id}_sub1`,
                    number: 1,
                    text: 'New part…',
                    marks: 2,
                    type: 'short_answer',
                    answerSpace: 'small',
                  },
                ];
              })
            }
          >
            + Sub-parts
          </MiniButton>
        )}
        {q.subQuestions?.length > 0 && (
          <MiniButton
            label="Add sub-sub-part"
            onClick={() =>
              commit((d) => {
                const sub = at(d).subQuestions[at(d).subQuestions.length - 1];
                sub.subQuestions = [
                  ...(sub.subQuestions ?? []),
                  {
                    id: `${sub.id}_ssub${(sub.subQuestions?.length ?? 0) + 1}`,
                    number: (sub.subQuestions?.length ?? 0) + 1,
                    text: 'New sub-part…',
                    marks: 2,
                    type: 'short_answer',
                    answerSpace: 'small',
                  },
                ];
              })
            }
          >
            + Level 3 part
          </MiniButton>
        )}
      </div>
    </div>
  );
}

/* ---------------- small UI atoms ---------------- */

function MobileSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end xl:hidden" role="dialog" aria-label={title}>
      <button
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40"
      />
      <div className="relative max-h-[78vh] w-full overflow-y-auto rounded-t-2xl border-t border-border bg-background p-4 pb-8 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <button onClick={onClose} className="rounded px-2 py-1 text-sm text-muted-foreground hover:bg-accent">
            Done
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function BarButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="min-w-0 flex-1 truncate rounded-md border border-input px-2 py-2 text-xs font-medium text-foreground hover:bg-accent"
    >
      {label}
    </button>
  );
}

function FormatButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      title={label}
      className="shrink-0 rounded border border-border px-2.5 py-1 text-xs text-foreground hover:bg-accent"
    >
      {children}
    </button>
  );
}

function ToolButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="rounded px-2 py-1 text-sm text-foreground hover:bg-accent disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function MiniButton({
  children,
  onClick,
  label,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="examedit-mini"
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function HeaderField({
  label,
  value,
  onChange,
  onFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onFocus: React.MutableRefObject<HTMLElement | null>;
}) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-semibold">{label}:</span>
      <EditableText
        value={value}
        multiline={false}
        placeholder={label}
        onFocus={(el) => (onFocus.current = el)}
        onChange={onChange}
      />
    </span>
  );
}

function EditorStyles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
      .examedit-sheet { padding: 1.5cm; box-shadow: 0 10px 30px rgba(15,23,42,.14); border-radius: 2px; color: #0f172a; font-family: Merriweather, "Times New Roman", serif; }
      .examedit-block { padding: .4rem; border-radius: 6px; margin-bottom: 1.2rem; }
      .examedit-question { padding: .5rem; border-radius: 6px; border: 1px solid transparent; }
      .examedit-question:hover { border-color: rgba(99,102,241,.35); background: rgba(99,102,241,.03); }
      .examedit-selected { border-color: rgb(99,102,241) !important; background: rgba(99,102,241,.06); box-shadow: 0 0 0 1px rgba(99,102,241,.25); }
      .examedit-field { outline: none; border-radius: 3px; padding: 0 2px; white-space: pre-wrap; display: inline-block; min-width: 2ch; }
      .examedit-field:hover { background: rgba(15,23,42,.05); }
      .examedit-field:focus { background: rgba(99,102,241,.10); box-shadow: inset 0 0 0 1px rgba(99,102,241,.5); }
      .examedit-field:empty::before { content: attr(data-placeholder); color: #94a3b8; }
      .examedit-mini { font-size: 10px; line-height: 1; padding: 4px 7px; border-radius: 4px; border: 1px solid #cbd5e1; color: #475569; background: #fff; }
      .examedit-inserts { opacity: 0; transition: opacity .12s ease; }
      .examedit-question:hover .examedit-inserts, .examedit-question:focus-within .examedit-inserts, .examedit-question.examedit-selected .examedit-inserts { opacity: 1; }
      .examedit-mini:hover:not(:disabled) { background: #eef2ff; border-color: #6366f1; color: #4338ca; }
      .examedit-mini:disabled { opacity: .35; }

      /* Answer space preview — identical geometry to the printed paper */
      .examedit-space { margin: .35rem 0 .5rem; }
      .examedit-space-line { height: .85cm; }
      .examedit-space[data-style="dotted"] .examedit-space-line { border-bottom: 1px dotted #0f172a; }
      .examedit-space[data-style="dashed"] .examedit-space-line { border-bottom: 1px dashed #0f172a; }
      .examedit-space[data-style="solid"] .examedit-space-line { border-bottom: 1px solid #0f172a; }
      .examedit-space[data-style="blank"] .examedit-space-line { border-bottom: 1px solid transparent; }
      .examedit-space[data-style="box"] { border: 1px solid #0f172a; border-radius: 2px; }
      .examedit-space[data-style="grid"] { border: 1px solid #0f172a; background-image: linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px); background-size: .5cm .5cm; }
      .examedit-space-editor { margin: .25rem 0 .6rem; padding: .45rem; border: 1px dashed #c7d2fe; border-radius: 6px; background: #f8faff; font-family: system-ui, sans-serif; }
    `,
      }}
    />
  );
}
