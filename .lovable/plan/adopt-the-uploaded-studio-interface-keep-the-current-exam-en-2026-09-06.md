# Adopt the uploaded Studio interface, keep the current exam engine

The uploaded project's look and layout become the new face of the app. Everything that
actually builds the exam paper — the NESA formatting rules, question banks, AI writing and
single-question AI editing already in this app — stays exactly as it is. None of the uploaded
project's generation code, server, Firebase or question logic is brought over.

## What the teacher will see

A single full-screen workspace instead of today's plain form:

- A slim top bar with the paper's name, undo/redo, a stage switcher (Plan, Build, Design,
  Audit) and a search button that opens a command palette (Ctrl/Cmd + K).
- A left panel that holds the setup form while planning (subject, level, term, year,
  duration, sections, marks, question types, official-format reset) and switches to a
  question/section outline once the paper exists.
- A centre stage showing the real A4 paper exactly as it prints today, with a big
  "describe your exam" start screen before generation.
- A right panel with question properties when a question is selected, and a quality panel
  (marks total, section balance, NESA checks) otherwise.
- On phones and tablets: panels become slide-up sheets, plus a bottom tab bar and a floating
  action button.
- The AI request bar at the bottom of the paper stays, with the same single-question
  skeleton loading.

## What gets carried over from the upload

Visual system and shell only: colour and type tokens, the UI primitives (buttons, cards,
badges, inputs, selects, segmented control, tooltips, skeletons, sheets, tab bar, FAB,
status pills, typography), the top bar, left/right panel chrome, command palette, quality
panel layout, navigator/inspector layout, and the workspace animations.

Left behind: its Express server, Firebase, its own AI calls, its exam schema, its
generation/validation engines, document ingestion, and the "Sources" stage (that stage is
future work, so the workspace opens on Plan).

## Missing pieces added to the uploaded UI

Things this app already does that the uploaded design has no place for, added in its style:

- Level/band awareness (P4–P6, S1–S3, S4–S6) with the detected official blueprint summary
  and "Reset to official format".
- Per-section question-type chips and live marks total.
- Print and Marking Guide actions, and the marking-guide view.
- Content source choice (AI-written vs curated bank).
- Insert/remove sub-parts up to three levels, page-break control, symbol palette.

## Technical notes

- Keep TanStack routing and today's URLs. `/` becomes the Plan stage of the workspace shell;
  `/exam/$id` and `/exam/$id/edit` render Build/Design inside the same shell;
  `/exam/$id/print` and `/exam/$id/guide` stay untouched print surfaces.
- New shared shell lives in `src/components/studio/` (AppShell, TopBar, LeftPane, RightPane,
  CommandPalette) plus `src/components/ui/primitives.tsx` ported from `UiPrimitives.tsx`.
- Design tokens merged into `src/styles.css` as semantic tokens (no hardcoded hex in
  components); print CSS untouched so paper output is byte-identical.
- Panels bind to existing state: `examBuilder` config, `useExamContent`, `ExamEditor` edit
  actions, `aiEditQuestion`. `ExamEditor` is refactored so its canvas/inspector/navigator
  render inside the new panes rather than its own layout.
- Add `framer-motion`; reuse existing lucide-react, clsx, tailwind-merge. No dnd-kit,
  Firebase, express, puppeteer, pagedjs.
- No change to generation, numbering, marks, layout engines, or AI prompts.

## Sequence

1. Tokens + primitives port.
2. Workspace shell (top bar, panes, mobile sheets, command palette).
3. Plan stage: existing setup form rebuilt with the new primitives, level blueprint intact.
4. Build/Design stage: existing editor canvas, navigator and inspector moved into the panes.
5. Audit panel wired to existing mark/NESA checks; print + marking guide actions.
6. Visual pass on desktop and mobile, verify a generated paper prints identically.
