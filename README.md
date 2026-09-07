# NESA Exam Builder

PROJECT PURPOSE — read this first, it should guide every decision below.

WHO THIS IS FOR: teachers in Rwanda who need to create exams matching

official NESA (National Examination and School Inspection Authority)

standards.

THE PROBLEM WE'RE SOLVING: writing good exam questions is only half the

work. Even a teacher who uses AI to help write questions still has to

spend hours in Microsoft Word manually fixing numbering, spacing,

answer lines, tables, and page breaks — because Word fights them at

every step, and because generic AI output never comes out looking like

an official exam paper. That formatting work, not the writing, is what

actually eats their time and energy.

WHAT THIS APP DOES: a teacher fills a short form — subject, level,

number of marks, sections — and gets back a complete, print-ready exam

that already looks like an official NESA paper. No Word. No manual

formatting. No fighting page breaks.

THE PART THAT MATTERS MOST — READ THIS TWICE:

Generating exam CONTENT is the easy part. Any AI can write questions.

What makes this app actually valuable — and what most AI-generated

documents get wrong — is FORMATTING, LAYOUT, HIERARCHY, and

CONSISTENCY:

- FORMATTING: every question type (multiple choice, matching, essay,

  fill-in-the-blank...) must always look the same way, every time it's

  generated — same fonts, same spacing, same answer-line style. Never

  improvised per-document.

- LAYOUT: numbering, marks, and answer spaces must sit in the same

  place on the page every time, correctly sized to how much the

  question is worth.

- HIERARCHY: a question can have sub-parts (a, b, c), and those can

  have their own sub-parts (i, ii) — up to 3 levels deep — and each

  level must be indented and numbered correctly and consistently.

- CONSISTENCY: generate the SAME exam config twice, and the formatting

  must come out identical both times. If formatting changes randomly

  between generations, the app has failed at its actual job.

THE GOLDEN RULE: the AI's job is to write good question CONTENT.

The AI must NEVER be responsible for deciding formatting, spacing,

page layout, or visual design — that must always come from fixed,

predictable rules in the code, not from the AI improvising. If AI

decides formatting, it will be inconsistent. If code decides

formatting, it will be reliable every single time. This separation is

the single most important design principle in this whole app — when in

doubt, ask "should this be decided by the AI, or should it be a fixed

rule?" and default to a fixed rule.

SUCCESS LOOKS LIKE: a teacher generates an exam, and it's already

indistinguishable from an official printed paper — not "pretty good,"

indistinguishable — every time, for every subject, with zero manual

formatting work needed afterward

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7d2ec1ff-007f-44b3-b19b-552b87ce6b4a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
