# Agent instructions – Mappa

Read `SPEC.md` before any task. It is the source of truth for scope, clinical content and design.

## Working rules
- Work on **one task at a time**, the one you are given. Do not start the next task on your own.
- Keep changes small. One task = one branch = one PR, with a conventional commit message
  (`feat:`, `fix:`, `test:`, `chore:`, `docs:`).
- Before finishing a task, run `npm test` and `npm run build`. Both must pass.
- At the end of each task, summarise in plain English: what changed, which files, and anything
  you were unsure about. Raúl reviews every change.

## Code rules
- TypeScript strict. No `any`.
- `src/domain/` must not import React or touch the DOM. It contains only types, data and pure functions.
- All clinical content (questions, copy, thresholds, exercises) lives in `src/domain/regions/shoulder.ts`.
  Never hard-code clinical text or thresholds in UI components.
- Every rule in `engine.ts` needs a unit test. When you change a rule, update its test.
- Do not add dependencies beyond Vite, React, TypeScript and Vitest without asking first.
- Plain CSS with the variables in `src/styles/tokens.css`. No UI libraries.
- Never change clinical content (questions, thresholds, dosages, cues) on your own. It is confirmed
  by Raúl. If something looks wrong or ambiguous, stop and ask instead of guessing.
