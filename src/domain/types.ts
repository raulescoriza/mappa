// Domain types for the Mappa clinical flow.
// Pure types only: no React, no DOM, no side effects.

export type RegionId = string

export interface Region {
  id: RegionId
  name: string
  redFlags: RedFlag[]
  exclusions: ExclusionQuestion[]
  irritabilityQuestions: IrritabilityQuestion[]
  levels: Level[]
  startingLevel: Record<Irritability, LevelNumber>
  startingLevelNote: string
  checkInThresholds: CheckInThresholds
  planNote: string
}

// --- Red flags -------------------------------------------------------------

export type RedFlagUrgency = 'emergency' | 'urgent' | 'gp' | 'doctor'

export interface RedFlag {
  id: string
  question: string
  urgency: RedFlagUrgency
  referralCopy: string
}

/** Yes/no answers keyed by red-flag question id. */
export type RedFlagAnswers = Record<string, boolean>

export type RedFlagScreening =
  { result: 'clear' } | { result: 'refer'; flag: RedFlag }

// --- Out-of-scope (exclusions) ----------------------------------------------

export interface ExclusionQuestion {
  id: string
  question: string
  outcomeCopy: string
}

/** Yes/no answers keyed by exclusion question id. */
export type ExclusionAnswers = Record<string, boolean>

export type ScopeCheck =
  { result: 'inScope' } | { result: 'outOfScope'; reason: ExclusionQuestion }

// --- Irritability ------------------------------------------------------------

export type Irritability = 'high' | 'moderate' | 'low'

export interface IrritabilityOption {
  label: string
  level: Irritability
}

export interface IrritabilityQuestion {
  id: string
  question: string
  options: IrritabilityOption[]
}

/** A multiple-choice answer: the question id and the chosen option label. */
export interface IrritabilityAnswer {
  questionId: string
  label: string
}

// --- Levels and exercises ------------------------------------------------------

export type LevelNumber = 1 | 2 | 3

export type Load = 'normal' | 'reduced'

export interface Exercise {
  id: string
  name: string
  /** Dosage at normal load, e.g. "3 × 12–15". */
  dosage: string
  cue: string
}

export interface Level {
  number: LevelNumber
  name: string
  frequency: string
  /** How the whole level is reduced when the load is dropped. */
  reducedLoad: string
  exercises: Exercise[]
}

/** Where the patient is in the plan: a level and the load currently being used. */
export interface LevelState {
  level: LevelNumber
  load: Load
}

// --- Weekly check-in ------------------------------------------------------------

export interface CheckIn {
  /** Pain during exercise, 0–10. */
  painDuring: number
  /** Next morning compared with the usual: better or same, or worse. */
  nextMorning: 'betterOrSame' | 'worse'
  /** Completed all sets without shrugging the shoulder. */
  allSetsCompleted: boolean
  /** Worse the next morning in two sessions in a row. */
  worseNextMorningTwice: boolean
}

export interface CheckInThresholds {
  /** Pain during exercise at or above this is a flare. */
  flarePain: number
  /** Pain during exercise at or below this (with a well morning and all sets) is a good response. */
  goodResponsePain: number
}

export type CheckInResult =
  | { decision: 'up'; next: LevelState }
  | { decision: 'stay'; next: LevelState }
  | { decision: 'reduceLoad'; next: LevelState }
  | { decision: 'restoreLoad'; next: LevelState }
  | { decision: 'down'; next: LevelState }
