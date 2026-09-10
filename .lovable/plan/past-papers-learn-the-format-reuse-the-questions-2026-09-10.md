# Past Papers: learn the format, reuse the questions

Teachers upload past exam papers. The app reads them, learns how that paper is
laid out, and can then produce new papers that look exactly like the originals —
either by mixing real questions from the uploaded papers, or by generating fresh
questions in the same shape.

## What the teacher gets

1. **Past papers library** — upload one or many papers (PDF, Word, or plain
   text) for a subject and level. Each upload shows what the app understood:
   the sections it found, how many questions in each, the marks, and the
   question types.
2. **Two ways to create a paper from them:**
   - **Mix** — real questions taken from the uploaded papers, shuffled across
     papers but kept in the right section (Section A questions stay in
     Section A). Press create again and you get a different mix.
   - **Fresh** — new questions written to match the same sections, marks,
     types and difficulty as the uploaded papers.
3. Either way the paper comes out in the app's own print-ready NESA layout —
   the uploaded paper decides *structure and content*, never fonts, spacing or
   page breaks.
4. Anything the app could not read is shown to the teacher in a short review
   step where they can fix a heading, split a question, or set marks. Nothing
   is silently dropped.

## The golden rule stays intact

The uploaded paper contributes: section names, section order, instructions,
marks per question, question counts, question types, sub-part depth, and the
question text itself. It contributes **nothing** to visual formatting — that
still comes only from the existing code rules and print CSS. So the same config
still produces an identical paper twice.

## Handling papers the system doesn't understand

This is the part that must never fail. Three layers:

1. **Structural parse (code).** Deterministic reader: finds SECTION headings,
   question numbers, `(a)/(i)` sub-parts, `(05 marks)` mark tags, instruction
   lines. Fast and reliable on typed papers.
2. **AI reading pass (content only).** The AI is asked to *label* the text it
   is given — "this block is a question, worth 5 marks, type: structured, has
   two sub-parts" — using a strict schema limited to the app's known types. It
   never returns layout.
3. **Unknown-type fallback.** If a question doesn't match any known type, it is
   stored as a **generic question** — stem + marks + sub-parts + answer space
   sized from the marks. It still prints perfectly using the standard question
   block; it just doesn't get a specialised widget (no matching table, no OMR
   strip). Unreadable fragments become review items, never printed garbage.
4. **Scanned / handwritten papers** have no selectable text. The app detects
   that and tells the teacher plainly, offering to let them paste or type the
   questions in instead. It never pretends to have read them.

So the output rule holds: whatever survives the parse is always well formatted,
because formatting never depends on the upload.

## Technical design

New folder `src/lib/pastpapers/`, reusing the existing source pipeline:

- `types.ts` — `PastPaper` (id, subjectId, level, year, fileName, sections),
  `PastSection` (name, instructions, order, marks, questions),
  `PastQuestion` (text, marks, type or `'generic'`, subParts up to 3 levels,
  confidence, needsReview), `PaperBlueprint` (the learned structure: ordered
  sections with name, instruction text, question count, marks pattern, type
  mix, sub-part depth).
- `extract.ts` — deterministic structural parser over the text produced by the
  existing `src/lib/source/parse.ts` (PDF/DOCX/txt, browser-side).
- `blueprint.ts` — derives a `PaperBlueprint` by consolidating several uploaded
  papers of the same subject/level: modal section count, modal marks per slot,
  dominant type per slot. Pure, deterministic.
- `store.ts` — localStorage library, same shape as `source/store.ts`, keyed by
  subject + level, capped in size.
- `mix.ts` — seeded selection: for each blueprint slot, pick a real question of
  the matching type/marks from the pool across papers, never repeating within
  one paper. Uses the existing `makeRng`/`seededShuffle`, so a seed reproduces
  a mix exactly.

AI side (server, existing gateway):

- `src/lib/ai/readPaper.ts` + a server function that takes a chunk of paper
  text and returns strict-schema labelled questions. Used only when the
  structural parse leaves low-confidence blocks.
- Fresh-generation reuses `plan.ts`/`generator.server.ts`: the blueprint is
  translated into the existing `SectionSpec[]` + quotas, so all current
  validation, numbering and layout engines apply unchanged.

Builder integration:

- `ExamBuildConfig` gains `pastPapers?: { blueprintId: string; mode: 'mix' |
  'fresh' }`. In `mix` mode the builder takes items from `mix.ts` instead of
  the bank; in `fresh` mode the blueprint only shapes the section plan.
- Generic questions map to a `BankType` of `'generic'` rendered by the standard
  `QuestionBlock` with mark-sized answer space.

UI:

- New route `src/routes/papers.tsx` — the library: upload area, per-paper cards
  showing what was understood, and the review list for flagged items.
- Onboarding gains a "Use past papers" option next to the existing bank/AI
  choice, with the Mix / Fresh toggle and a preview of the learned structure.
- The bottom assistant bar's "Add to this paper" menu gets "Upload past
  papers".

## Build order

1. Types, extractor, blueprint, store (pure logic, testable).
2. Review UI + papers library route.
3. Mix mode wired into the builder; generic question rendering.
4. AI reading pass for low-confidence blocks.
5. Fresh mode via the existing generator.
