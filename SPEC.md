# Mappa – Shoulder flow prototype · Spec

## Goal
A small web prototype of the shoulder flow described in the case study
(https://raulescoriza.github.io/rehab-case-study.html). It must be clickable end to end
and be demoable in about 2 minutes. It is a portfolio piece, not a product.

## Scope
Only the shoulder. Six steps:

1. **Body map** – front/back toggle. Only the shoulders (left/right) are selectable;
   other regions are shown but disabled with a "coming soon" label.
2. **Red-flag screen** – 5 yes/no questions. Any "yes" ends the flow on a referral screen
   whose urgency and copy depend on the question.
3. **Out-of-scope check** – 2 yes/no questions. A "yes" ends the flow on a calm
   "see a physio in person" screen (different tone from red flags).
4. **Irritability** – 3 multiple-choice questions → irritability (high / moderate / low)
   → starting level.
5. **Plan** – the exercises of the current level with dosage, frequency and a plain-language cue.
   Video area is a placeholder ("Avatar demo · in development").
6. **Weekly check-in** – the user reports symptom response; the app says level up / stay /
   reduce load / level down and shows the new plan.

### Non-goals
No backend, no accounts, no real videos, no other body regions, no analytics,
no i18n (English only), no persistence beyond the current session (optional: sessionStorage).

## Stack
- Vite + React + TypeScript (strict)
- Vitest for unit tests
- Plain CSS with CSS variables (no UI library, no Tailwind)
- Deployed to GitHub Pages with a GitHub Actions workflow (Vite `base: '/mappa/'`)

## Architecture
The clinical logic is **data + pure functions**, fully separate from the UI.
Adding a new region later must mean adding a data file, not changing the engine.

```
src/
  domain/
    types.ts         // Region, RedFlag, ExclusionQuestion, IrritabilityQuestion, Level, Exercise, CheckIn…
    regions/
      shoulder.ts    // ALL shoulder content: questions, referrals, levels, exercises, thresholds
    engine.ts        // pure functions only, no React, no DOM
    engine.test.ts   // tests for every rule below
  ui/
    screens/         // one component per step
    components/      // BodyMap, YesNoQuestion, ExerciseCard, …
    flow.ts          // useReducer state machine: map → redFlags → (referral | scope) → (outOfScope | irritability) → plan → checkIn → plan
  styles/tokens.css  // design tokens (below)
  App.tsx
```

### Engine functions (signatures are a suggestion)
- `screenRedFlags(region, answers) → { result: 'clear' } | { result: 'refer', flag: RedFlag }`
  – returns the **most urgent** flag if several are "yes".
- `checkScope(region, answers) → { result: 'inScope' } | { result: 'outOfScope', reason }`
- `classifyIrritability(region, answers) → 'high' | 'moderate' | 'low'`
- `startingLevel(region, irritability) → 1 | 2 | 3`
- `evaluateCheckIn(region, current: { level, load: 'normal' | 'reduced' }, checkIn)
   → { decision: 'up' | 'stay' | 'reduceLoad' | 'restoreLoad' | 'down', next: { level, load } }`

## Clinical content (shoulder)
Source of truth: the case study, reviewed and confirmed by Raúl (physiotherapist).
Thresholds come from his clinical practice.

### Red flags (any "yes" → refer; urgency order: emergency > urgent > gp/doctor)
| id | Question | Urgency | Referral copy |
|---|---|---|---|
| trauma | Did the pain start after a fall or blow, with a visible deformity or being unable to lift the arm? | urgent | Go to A&E / urgent care today. |
| cardiac | Does the pain come with exertion together with chest pain, shortness of breath or a cold sweat? | emergency | Call the emergency number (112) now. |
| infection | Do you have a fever, or is the shoulder red, hot and swollen? | urgent | See a doctor today. |
| systemic | Have you had cancer, lost weight without trying, or do you have constant pain at night that no position eases? | gp | Book an appointment with your GP. |
| neuro | Do you have tingling or numbness spreading down the arm, or weakness that is getting worse? | doctor | See a doctor before starting exercises. |

### Out-of-scope
| id | Question | Outcome copy |
|---|---|---|
| surgery | Have you had shoulder surgery in the last few months? | Follow your surgeon's rehab protocol. |
| passiveRom | Is the movement very limited even when someone else moves your arm, especially turning it outwards? | Get an in-person assessment: this needs a hands-on exam (possible stiff / frozen shoulder). |

### Irritability
Each answer maps to high / moderate / low:
| Question | High | Moderate | Low |
|---|---|---|---|
| Do you have pain at rest? | Yes | Sometimes | No |
| Does the pain wake you at night? | Almost every night | Sometimes | Rarely |
| After activity, how long does the pain last? | Hours | Less than 1 hour | Minutes |

Classification rule: the category with most answers wins; on a tie (one answer in each
category), the more irritable category wins (safety first).

Starting level: high → 1, moderate → 2, low → 2 (copy: "Level 3 if Level 2 feels easy").

### Levels and exercises
Each level has a **normal** and a **reduced** load.

**Level 1 · Isometrics** – daily · reduced load: 5 × 20 s at lighter effort
- Wall external rotation (isometric) – 5 × 30 s at submaximal effort, no more than mild discomfort.
  Cue: "Elbow bent at 90° against your side, press the back of your hand into a wall without moving."
- Wall abduction (isometric) – 5 × 30 s.
  Cue: "Stand side-on to a wall, press the outside of your elbow into it as if lifting the arm sideways."

**Level 2 · Light load** – every other day · reduced load: 2 × 10 with a lighter band
- Band external rotation – 3 × 12–15. Cue: "Elbow tucked to your side, rotate the hand outwards slowly."
- Band row – 3 × 12–15. Cue: "Pull your elbows back and squeeze your shoulder blades together."
- Scaption to 90° – 3 × 12–15. Cue: "Lift the arms forward at a slight angle, thumbs up, up to shoulder height."

**Level 3 · Progressive load** – every other day · reduced load: 3 × 8–10 with a lighter weight
- Heavier band or dumbbell external rotation – 3 × 6–8. Cue: "Elbow tucked to your side, rotate the hand outwards slowly."
- Light overhead press – 3 × 6–8. Cue: "Press up without shrugging; stop before pain rises."
- Incline push-up – 3 × 6–8. Cue: "Hands on a table or wall, body in a straight line."

### Weekly check-in
Inputs:
- Pain during exercise, 0–10 (slider)
- Next morning compared with your usual: better or same / worse
- Completed all sets without shrugging the shoulder: yes / no
- Worse the next morning in 2 sessions in a row: yes / no

Definitions:
- **Flare** = pain during ≥ 4, **or** worse next morning in 2 sessions in a row.
- **Good response** = pain during ≤ 3 **and** next morning better or same **and** all sets completed.

Rules (thresholds from Raúl's clinical practice: intensity is always reduced when pain reaches 4/10),
evaluated in this order:
1. **Flare at normal load** → **reduceLoad**: same level, reduced load.
2. **Flare at reduced load**:
   - Level 2 or 3 → **down**: one level lower, normal load, and stay there.
   - Level 1 → **stay** at Level 1 with reduced load (no lower level; no referral from this rule).
3. **Good response at reduced load** → **restoreLoad**: same level, normal load (never skip straight up).
4. **Good response at normal load** → **up**: next level, normal load.
   At Level 3, "up" means "stay at Level 3 and increase the load".
5. Otherwise → **stay** (same level and load).

Also show, on the plan screen: "No improvement after about 6 weeks? Get an in-person assessment."

## Design
Match the Figma landing / case study.
```css
--bg:#F5F3EE; --surface:#FFFFFF; --ink:#14201C; --muted:#5A6763;
--primary:#0E6B5C; --primary-soft:#DCEEE8; --accent:#E2603F; --accent-soft:#FBE3DA;
--line:#E2DDD3; --body:#D8D2C6;
Headings: Fraunces 600 · Body: DM Sans (Google Fonts)
```
- Mobile-first, centred column max 480px (it should feel like the app screen in the case study).
- Body map: reuse the SVG silhouette from the case study; selected region in `--accent`.
- Red flags / referral use `--accent`; out-of-scope uses neutral tones; plan uses `--primary`.
- Persistent footer: "Concept prototype. Not intended to diagnose, and not a substitute for an
  assessment by a healthcare professional."
- Accessible: real `<button>`s, visible focus, labelled inputs, works with keyboard only.

## Acceptance criteria
- Every rule in "Clinical content" has at least one unit test in `engine.test.ts`, including:
  most-urgent red flag wins, tie-break in irritability, pain exactly 3 vs exactly 4,
  flare at normal vs reduced load, Level 1 floor (stays reduced), Level 3 ceiling,
  and restoring load before levelling up.
- `npm test` and `npm run build` pass with no TypeScript errors.
- The full flow works on a 390px-wide phone and on desktop.
- Deployed on GitHub Pages; the URL is linked from the case study.
- README explains: what it is, the architecture (domain vs UI), how to run, and that it was
  built with AI coding agents from Raúl's spec and clinical logic.
