# Finish and validate the past-paper system

## Goal
Complete the interrupted past-paper workflow on top of the uploaded current version, while preserving the deterministic NESA exam engine. Unsupported question types must always become printable plain questions rather than breaking a paper.

## Build
1. Merge the uploaded `/papers` library screen and fix its current compile and unreadable-file handling issues.
2. Connect past papers from the setup screen and the bottom Add menu. Teachers can select compatible uploads, choose Mix or Fresh, and apply the learned section structure.
3. Strengthen extraction and mixing so sections are matched by normalized section identity, question IDs cannot collide across papers, unclear content stays reviewable, and unknown types use a dedicated safe generic path with mark-sized answer space.
4. Preserve exact-question reuse in Mix mode and exemplar-based writing in Fresh mode; neither path can influence fonts, spacing, numbering, or page layout.
5. Add focused automated checks for parsing, unsupported types, section-safe mixing, mark totals, determinism, and config round-tripping.
6. Test the complete browser journey: upload/paste, review, Mix creation, preview, edit, marking guide, and print at desktop and mobile widths.
7. Update `roadmap.md` and `NOTES.md` with completed work and any external blocker.

## Technical details
- Keep browser-local storage; no account or cloud storage is added.
- Use the existing deterministic builder and print components for all output.
- Do not copy `.git` or replace the current project wholesale; merge only the newer route and related targeted changes.
- Verify every content route has complete metadata and leave the preview with no build/runtime errors.
