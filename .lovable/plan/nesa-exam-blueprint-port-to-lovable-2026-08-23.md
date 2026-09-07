# NESA Exam Blueprint — port to Lovable

Port the uploaded project's deterministic formatting engine into this app, keeping the golden rule intact: **code decides all formatting; AI only ever writes question content.**

The uploaded app is an Express + Firebase + Puppeteer project (~1.9 MB of source). Its runtime pieces cannot run here, but its most valuable parts — the print CSS, the block renderers, and the layout/numbering/mark contracts — are pure and portable. Those come across as-is wherever possible.

## What gets ported directly

These are the deterministic formatting core and move over with minimal edits:

- `src/print.css` — A4 `@page` rules, answer-line styles, table styles, spacing tokens
- `src/components/blocks/*` — QuestionBlock, SectionBlock, AnswerSpace, MatchingTable, MultipleChoiceGrid, TrueFalse, DataTable, DottedLineFill, SummaryBox, SwotMatrix, CalculationWorkingArea, CoordinateGrid, OMRShadingStrip, QuestionText
- `src/components/ExamPrintView.tsx` and `MarkingGuidePrintView.tsx`
- `src/types.ts`, `src/types/*` (question contracts, numbering/layout, mark accounting, instruction engine)
- `src/backend/engine/numberingLayoutEngine.ts`, `markAccountingEngine.ts`, `instructionEngine.ts`, `sanitizationEngine.ts` and the per-question-type contract engines (mcq, matching, true/false, short answer, fill blank, table, essay/composition, calculation, transformation, summary, error correction, case study)
- `src/data/nesaBlueprints.ts`, `presets.ts`, `templates.ts`
- `src/utils/*` formatting helpers (questionSpecs, nesaAuditor, textEmphasis, sanitizeHtml, languageUtils, dateTimeUtils)
- The contract test suites under `scripts/` (adapted to Vitest) so consistency stays provable

## What gets rebuilt rather than ported

- Express server and routes → TanStack server functions
- Firebase / Firestore persistence → dropped for now (no accounts in this phase)
- Puppeteer / pagedjs PDF export → browser print-to-PDF (`window.print()` against the ported `print.css`)
- Gemini service → left as a clean seam, wired later in Phase 2
- The 111 KB `App.tsx` monolith → split into routes and focused components; behaviour preserved, structure modernised
- Vision/OCR, knowledge-graph, diagram AI, and document-intelligence subsystems → out of scope for this phase

## Build phases

**Phase 1 — deterministic layout engine (this phase)**
1. Port types, contracts, and formatting engines; get them typechecking in this stack.
2. Port `print.css` and every block renderer; render into a fixed A4 page frame with correct margins, header/footer, and page-break control.
3. Port the NESA blueprint data and the exam config form (subject, level, marks, sections, duration).
4. Build the exam from **fixed seed content** across all subjects, covering the core question types (MCQ, true/false, matching, fill-in-the-blank, short answer, structured with a/b/c and i/ii sub-parts, essay).
5. Print-to-PDF route: `/exam/:id/print` renders print-only markup; a Print button triggers `window.print()`.
6. Marking guide print view alongside the exam.
7. Port the contract suites as Vitest tests, plus a determinism test: the same config rendered twice yields byte-identical markup.

**Phase 2 — AI content (after Phase 1 is proven)**
AI generation via Lovable AI, returning strictly-schema'd content only (question stems, options, answers, marks) with zero formatting fields. Everything visual keeps coming from the ported engines.

## Technical notes

- Hierarchy is enforced by `numberingLayoutEngine`: level 1 numeric, level 2 `(a)(b)(c)`, level 3 `(i)(ii)(iii)`, each with a fixed indent step from CSS tokens — never per-document values.
- Answer-space height is a pure function of question type and marks, computed in code.
- Question renderers accept content-only props; there is no formatting prop anywhere in a block's public interface, which makes AI-driven formatting structurally impossible.
- All print rules live in the ported `print.css`; the app's Tailwind theme handles screen chrome only and never touches the paper surface.
- Routes: `/` (config form), `/exam/:id` (editable preview), `/exam/:id/print`, `/exam/:id/guide`.
