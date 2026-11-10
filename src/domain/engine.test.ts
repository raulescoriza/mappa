import { describe, expect, it } from 'vitest'

import {
  checkScope,
  classifyIrritability,
  evaluateCheckIn,
  screenRedFlags,
  startingLevel,
} from './engine'
import { shoulder } from './regions/shoulder'
import type {
  CheckIn,
  ExclusionAnswers,
  IrritabilityAnswer,
  LevelNumber,
  LevelState,
  RedFlagAnswers,
} from './types'

function redFlagAnswers(yes: string[]): RedFlagAnswers {
  const answers: RedFlagAnswers = {}
  for (const flag of shoulder.redFlags) answers[flag.id] = yes.includes(flag.id)
  return answers
}

function exclusionAnswers(yes: string[]): ExclusionAnswers {
  const answers: ExclusionAnswers = {}
  for (const question of shoulder.exclusions)
    answers[question.id] = yes.includes(question.id)
  return answers
}

function irritabilityAnswers(
  painAtRest: string,
  nightWaking: string,
  painAfterActivity: string,
): IrritabilityAnswer[] {
  return [
    { questionId: 'painAtRest', label: painAtRest },
    { questionId: 'nightWaking', label: nightWaking },
    { questionId: 'painAfterActivity', label: painAfterActivity },
  ]
}

// A quiet week by default: mild pain, well the next morning, all sets done.
function checkIn(overrides: Partial<CheckIn> = {}): CheckIn {
  return {
    painDuring: 2,
    nextMorning: 'betterOrSame',
    allSetsCompleted: true,
    worseNextMorningTwice: false,
    ...overrides,
  }
}

function at(level: LevelNumber, load: 'normal' | 'reduced'): LevelState {
  return { level, load }
}

describe('screenRedFlags', () => {
  it('all no answers clear the screening', () => {
    expect(screenRedFlags(shoulder, redFlagAnswers([]))).toEqual({
      result: 'clear',
    })
  })

  it('a yes to the cardiac question refers for an emergency', () => {
    const result = screenRedFlags(shoulder, redFlagAnswers(['cardiac']))
    expect(result).toEqual({
      result: 'refer',
      flag: {
        id: 'cardiac',
        question:
          'Does the pain come with exertion together with chest pain, shortness of breath or a cold sweat?',
        urgency: 'emergency',
        referralCopy: 'Call the emergency number (112) now.',
      },
    })
  })

  it('the most urgent flag wins when several are answered yes', () => {
    const result = screenRedFlags(
      shoulder,
      redFlagAnswers(['trauma', 'cardiac', 'systemic']),
    )
    expect(result).toEqual({
      result: 'refer',
      flag: expect.objectContaining({ id: 'cardiac' }),
    })
  })

  it('urgent beats gp and doctor when all three are answered yes', () => {
    const result = screenRedFlags(
      shoulder,
      redFlagAnswers(['trauma', 'systemic', 'neuro']),
    )
    expect(result).toEqual({
      result: 'refer',
      flag: expect.objectContaining({ id: 'trauma' }),
    })
  })

  it('equal urgency refers to the flag listed first', () => {
    const result = screenRedFlags(
      shoulder,
      redFlagAnswers(['systemic', 'neuro']),
    )
    expect(result).toEqual({
      result: 'refer',
      flag: expect.objectContaining({ id: 'systemic' }),
    })
  })
})

describe('checkScope', () => {
  it('no exclusions answered yes stay in scope', () => {
    expect(checkScope(shoulder, exclusionAnswers([]))).toEqual({
      result: 'inScope',
    })
  })

  it('recent shoulder surgery sends to the surgeon protocol', () => {
    const result = checkScope(shoulder, exclusionAnswers(['surgery']))
    expect(result).toEqual({
      result: 'outOfScope',
      reason: expect.objectContaining({
        id: 'surgery',
        outcomeCopy: "Follow your surgeon's rehab protocol.",
      }),
    })
  })

  it('very limited passive movement sends to an in-person assessment', () => {
    const result = checkScope(shoulder, exclusionAnswers(['passiveRom']))
    expect(result).toEqual({
      result: 'outOfScope',
      reason: expect.objectContaining({
        id: 'passiveRom',
        outcomeCopy:
          'Get an in-person assessment: this needs a hands-on exam (possible stiff / frozen shoulder).',
      }),
    })
  })

  it('both exclusions answered yes use the one listed first', () => {
    const result = checkScope(
      shoulder,
      exclusionAnswers(['surgery', 'passiveRom']),
    )
    expect(result).toEqual({
      result: 'outOfScope',
      reason: expect.objectContaining({ id: 'surgery' }),
    })
  })
})

describe('classifyIrritability', () => {
  it('three high answers classify as high', () => {
    const answers = irritabilityAnswers('Yes', 'Almost every night', 'Hours')
    expect(classifyIrritability(shoulder, answers)).toBe('high')
  })

  it('two moderate and one low classify as moderate', () => {
    const answers = irritabilityAnswers('Sometimes', 'Sometimes', 'Minutes')
    expect(classifyIrritability(shoulder, answers)).toBe('moderate')
  })

  it('two low and one high classify as low', () => {
    const answers = irritabilityAnswers('No', 'Rarely', 'Hours')
    expect(classifyIrritability(shoulder, answers)).toBe('low')
  })

  it('one answer in each category resolves to the more irritable', () => {
    const answers = irritabilityAnswers('Yes', 'Sometimes', 'Minutes')
    expect(classifyIrritability(shoulder, answers)).toBe('high')
  })
})

describe('startingLevel', () => {
  it('high irritability starts at level 1', () => {
    expect(startingLevel(shoulder, 'high')).toBe(1)
  })

  it('moderate irritability starts at level 2', () => {
    expect(startingLevel(shoulder, 'moderate')).toBe(2)
  })

  it('low irritability starts at level 2', () => {
    expect(startingLevel(shoulder, 'low')).toBe(2)
  })
})

describe('evaluateCheckIn', () => {
  it('a flare at normal load reduces the load at the same level', () => {
    const result = evaluateCheckIn(
      shoulder,
      at(2, 'normal'),
      checkIn({ painDuring: 6 }),
    )
    expect(result).toEqual({ decision: 'reduceLoad', next: at(2, 'reduced') })
  })

  it('pain exactly 4 is a flare and reduces the load at normal load', () => {
    const result = evaluateCheckIn(
      shoulder,
      at(2, 'normal'),
      checkIn({ painDuring: 4 }),
    )
    expect(result).toEqual({ decision: 'reduceLoad', next: at(2, 'reduced') })
  })

  it('worse next morning in two sessions in a row is a flare and reduces the load', () => {
    const result = evaluateCheckIn(
      shoulder,
      at(2, 'normal'),
      checkIn({ painDuring: 1, worseNextMorningTwice: true }),
    )
    expect(result).toEqual({ decision: 'reduceLoad', next: at(2, 'reduced') })
  })

  it('a flare at reduced load on level 2 steps down to level 1 at normal load', () => {
    const result = evaluateCheckIn(
      shoulder,
      at(2, 'reduced'),
      checkIn({ painDuring: 7 }),
    )
    expect(result).toEqual({ decision: 'down', next: at(1, 'normal') })
  })

  it('a flare at reduced load on level 3 steps down to level 2 at normal load', () => {
    const result = evaluateCheckIn(
      shoulder,
      at(3, 'reduced'),
      checkIn({ painDuring: 7 }),
    )
    expect(result).toEqual({ decision: 'down', next: at(2, 'normal') })
  })

  it('a flare at reduced load on level 1 stays at level 1 with reduced load', () => {
    const result = evaluateCheckIn(
      shoulder,
      at(1, 'reduced'),
      checkIn({ painDuring: 7 }),
    )
    expect(result).toEqual({ decision: 'stay', next: at(1, 'reduced') })
  })

  it('a good response at reduced load restores the normal load at the same level', () => {
    const result = evaluateCheckIn(shoulder, at(2, 'reduced'), checkIn())
    expect(result).toEqual({ decision: 'restoreLoad', next: at(2, 'normal') })
  })

  it('a good response at reduced load only restores the load, it does not level up', () => {
    const result = evaluateCheckIn(shoulder, at(1, 'reduced'), checkIn())
    expect(result).toEqual({ decision: 'restoreLoad', next: at(1, 'normal') })
  })

  it('a good response at normal load levels up', () => {
    const result = evaluateCheckIn(shoulder, at(1, 'normal'), checkIn())
    expect(result).toEqual({ decision: 'up', next: at(2, 'normal') })
  })

  it('a good response at level 3 stays at level 3 to increase the load', () => {
    const result = evaluateCheckIn(shoulder, at(3, 'normal'), checkIn())
    expect(result).toEqual({ decision: 'up', next: at(3, 'normal') })
  })

  it('pain exactly 3 with a good response at normal load levels up', () => {
    const result = evaluateCheckIn(
      shoulder,
      at(1, 'normal'),
      checkIn({ painDuring: 3 }),
    )
    expect(result).toEqual({ decision: 'up', next: at(2, 'normal') })
  })

  it('pain exactly 4 is not a good response and does not level up', () => {
    const result = evaluateCheckIn(
      shoulder,
      at(1, 'normal'),
      checkIn({ painDuring: 4 }),
    )
    expect(result).toEqual({ decision: 'reduceLoad', next: at(1, 'reduced') })
  })

  it('pain 3 with an incomplete session stays at the same level and load', () => {
    const result = evaluateCheckIn(
      shoulder,
      at(2, 'normal'),
      checkIn({ painDuring: 3, allSetsCompleted: false }),
    )
    expect(result).toEqual({ decision: 'stay', next: at(2, 'normal') })
  })

  it('a worse next morning without two sessions in a row stays at the same level and load', () => {
    const result = evaluateCheckIn(
      shoulder,
      at(2, 'normal'),
      checkIn({ nextMorning: 'worse' }),
    )
    expect(result).toEqual({ decision: 'stay', next: at(2, 'normal') })
  })
})
