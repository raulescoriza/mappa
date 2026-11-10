// The clinical engine: pure functions over region data.
// No React, no DOM. All thresholds and copy come from the region.

import type {
  CheckIn,
  CheckInResult,
  ExclusionAnswers,
  Irritability,
  IrritabilityAnswer,
  LevelNumber,
  LevelState,
  RedFlag,
  RedFlagAnswers,
  RedFlagScreening,
  RedFlagUrgency,
  Region,
  ScopeCheck,
} from './types'

/** Higher rank = more urgent. gp and doctor share the last rank. */
const URGENCY_RANK: Record<RedFlagUrgency, number> = {
  emergency: 3,
  urgent: 2,
  gp: 1,
  doctor: 1,
}

/** More irritable first: the order used to break ties (safety first). */
const IRRITABILITY_ORDER: Irritability[] = ['high', 'moderate', 'low']

/**
 * Screen the red-flag answers. Any "yes" refers; if several are "yes",
 * the most urgent flag wins (emergency > urgent > gp/doctor).
 */
export function screenRedFlags(
  region: Region,
  answers: RedFlagAnswers,
): RedFlagScreening {
  let mostUrgent: { rank: number; flag: RedFlag } | undefined
  for (const flag of region.redFlags) {
    if (!answers[flag.id]) continue
    const rank = URGENCY_RANK[flag.urgency]
    if (mostUrgent === undefined || rank > mostUrgent.rank) {
      mostUrgent = { rank, flag }
    }
  }
  if (mostUrgent === undefined) return { result: 'clear' }
  return { result: 'refer', flag: mostUrgent.flag }
}

/**
 * Check the out-of-scope exclusions. Any "yes" ends the flow with a calm
 * in-person assessment message; with several "yes" the first listed applies.
 */
export function checkScope(
  region: Region,
  answers: ExclusionAnswers,
): ScopeCheck {
  for (const question of region.exclusions) {
    if (answers[question.id]) {
      return { result: 'outOfScope', reason: question }
    }
  }
  return { result: 'inScope' }
}

/**
 * Classify irritability from the multiple-choice answers.
 * The category with the most answers wins; on a tie the more
 * irritable category wins (safety first).
 */
export function classifyIrritability(
  region: Region,
  answers: IrritabilityAnswer[],
): Irritability {
  const counts: Record<Irritability, number> = { high: 0, moderate: 0, low: 0 }
  for (const answer of answers) {
    const question = region.irritabilityQuestions.find(
      (q) => q.id === answer.questionId,
    )
    const option = question?.options.find((o) => o.label === answer.label)
    if (option !== undefined) counts[option.level] += 1
  }
  const mostFrequent = Math.max(counts.high, counts.moderate, counts.low)
  const winner = IRRITABILITY_ORDER.find(
    (level) => counts[level] === mostFrequent,
  )
  if (winner === undefined) return 'high'
  return winner
}

/** The starting level for a given irritability, as defined by the region. */
export function startingLevel(
  region: Region,
  irritability: Irritability,
): LevelNumber {
  return region.startingLevel[irritability]
}

function levelBelow(level: LevelNumber): LevelNumber {
  if (level === 1) return 1
  if (level === 2) return 1
  return 2
}

function levelAbove(level: LevelNumber): LevelNumber {
  if (level === 1) return 2
  if (level === 2) return 3
  return 3
}

/**
 * Evaluate the weekly check-in.
 *
 * A flare is pain during at or above the region's flare threshold, or worse
 * the next morning in two sessions in a row. A good response is pain during
 * at or below the region's good-response threshold, a better-or-same next
 * morning, and all sets completed.
 *
 * Rules, in order:
 * 1. Flare at normal load -> reduceLoad (same level, reduced load).
 * 2. Flare at reduced load -> down one level at normal load (level 2 or 3);
 *    at level 1 stay at level 1 with reduced load.
 * 3. Good response at reduced load -> restoreLoad (same level, normal load).
 * 4. Good response at normal load -> up one level at normal load;
 *    at level 3 stay at level 3 and increase the load.
 * 5. Otherwise -> stay at the same level and load.
 */
export function evaluateCheckIn(
  region: Region,
  current: LevelState,
  checkIn: CheckIn,
): CheckInResult {
  const { flarePain, goodResponsePain } = region.checkInThresholds

  const isFlare =
    checkIn.painDuring >= flarePain || checkIn.worseNextMorningTwice
  const isGoodResponse =
    checkIn.painDuring <= goodResponsePain &&
    checkIn.nextMorning === 'betterOrSame' &&
    checkIn.allSetsCompleted

  if (isFlare) {
    if (current.load === 'normal') {
      return {
        decision: 'reduceLoad',
        next: { level: current.level, load: 'reduced' },
      }
    }
    if (current.level >= 2) {
      return {
        decision: 'down',
        next: { level: levelBelow(current.level), load: 'normal' },
      }
    }
    return { decision: 'stay', next: { level: 1, load: 'reduced' } }
  }

  if (isGoodResponse) {
    if (current.load === 'reduced') {
      return {
        decision: 'restoreLoad',
        next: { level: current.level, load: 'normal' },
      }
    }
    return {
      decision: 'up',
      next: { level: levelAbove(current.level), load: 'normal' },
    }
  }

  return {
    decision: 'stay',
    next: { level: current.level, load: current.load },
  }
}
