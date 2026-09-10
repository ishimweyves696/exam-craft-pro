# NESA Exam Builder — working memory

This file travels with the code. It records decisions, current state and what
remains, so any session (human or AI) can continue without re-discovering it.

## Product goal

A teacher enters parameters and the system produces a paper indistinguishable
from a real Rwandan (NESA/REB) teacher's exam. Quality over quantity.

## Architecture (unchanged rules)

- TanStack Start. Routes: `/` (Plan/setup), `/exam/$id` (Build/preview),
  `/exam/$id/edit` (Design/editor), `/exam/$id/print`, `/exam/$id/guide`.
- Paper layout is code-owned. `src/print.css` and the block components decide
  formatting; AI never emits layout.
- Same config → same paper. Config is encoded in the exam id.
- Engines in `src/backend/engine/` own numbering, marks accounting,
  instructions, sanitisation and per-question-type contracts.

## Current state

Done:
- Extra question layouts: data response, dialogue, graph plotting, letter
  writing, translation, guided composition, equations.
- Subject registry knows which classes each subject is examined at
  (`levelsForSubject`, `subjectHasLevel` in `src/lib/examBank.ts`).
- Section rules: each section keeps its official purpose, marks, minutes,
  thinking level and answer length. Out-of-rule question types are blocked at
  setup, blocked during writing, and dropped if AI returns one. Mathematics
  allows multiple-choice in Section A (O- and A-Level), per 2024/25 papers.
- Engine-side onboarding fields: paper language (Kinyarwanda / French /
  Kiswahili papers are written in that language), cover page on/off with school
  name and custom candidate instructions, class-test mode (no section
  headings), exact questions per section (marks split evenly), advanced
  sub-part range per section.
- Matching questions are dynamic (table / two-column / response-column /
  automatic) and true-false answering space is dynamic (dotted / box /
  automatic), switchable per question in the editor.
- Source material foundation in `src/lib/source/` (PDF/DOCX/text parsing,
  unit outline detection, localStorage store, excerpt payloads). Full books
  stay on the device; only selected ids travel in the exam config.
- Studio shell UI (Apple-style): white top bar, stage switcher (Plan, Build,
  Design, Audit), left/right panes with mobile sheets, command palette (⌘K),
  and the bottom assistant bar on every workspace screen.

Assistant bar wiring (UI only, logic later):
- `+` → Add to this paper: upload source material, choose curriculum units,
  start another paper.
- `…` → Paper actions: Print/PDF, Marking guide, Format check.
- Stage pill → Plan / Build / Design / Audit.
- Mic and Send → visible, and honestly say the assistant is next.

## Remaining

1. Rebuild the onboarding screen around the new model: subject + class +
   section required; everything else in an optional area (cover page, language,
   exam/test switch); per-section fields (name, marks, number of questions,
   types, advanced sub-parts, parts).
2. Syllabus topics per new subject per class (S1–S6); until then those subjects
   fall back to generic topics.
3. Verify paper structure for the new language/humanities subjects against
   trusted NESA/REB sources.
4. Primary (P4–P6) pass after secondary is confirmed.

## Chat assistant — agreed direction (not built)

- Second surface over the same engine, never a replacement for the form.
- AI gets a fixed action set (plan paper, add/replace/reword question, change
  marks, change section, restructure) — chat fills the same config.
- Every proposal renders as a card with the real printed question and
  Approve / Adjust / Discard. Nothing changes the paper until approved.
- Style overrides only as named presets (NESA standard, school mock,
  worksheet). No free-form typographic instructions to the AI.
- Open decisions before building: threaded conversations vs one conversation,
  and whether history is saved to an account, to the browser, or not at all.
