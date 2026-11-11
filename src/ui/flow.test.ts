import { describe, expect, it } from 'vitest'

import { shoulder } from '../domain/regions/shoulder'
import type { CheckIn } from '../domain/types'
import { flowReducer, initialState, type FlowState } from './flow'

const goodCheckIn: CheckIn = {
  painDuring: 2,
  nextMorning: 'betterOrSame',
  allSetsCompleted: true,
  worseNextMorningTwice: false,
}

function toRedFlags(): FlowState {
  return flowReducer(initialState, {
    type: 'SELECT_REGION',
    regionId: 'shoulder',
  })
}

function toRedFlagsAnswered(value: boolean): FlowState {
  let state = toRedFlags()
  for (const flag of shoulder.redFlags) {
    state = flowReducer(state, { type: 'ANSWER', questionId: flag.id, value })
  }
  return state
}

function toExclusions(): FlowState {
  return flowReducer(toRedFlagsAnswered(false), { type: 'SUBMIT_STEP' })
}

function toIrritability(): FlowState {
  let state = toExclusions()
  for (const question of shoulder.exclusions) {
    state = flowReducer(state, {
      type: 'ANSWER',
      questionId: question.id,
      value: false,
    })
  }
  return flowReducer(state, { type: 'SUBMIT_STEP' })
}

const irritabilityLabels = {
  high: ['Yes', 'Almost every night', 'Hours'],
  moderate: ['Sometimes', 'Sometimes', 'Less than 1 hour'],
  low: ['No', 'Rarely', 'Minutes'],
} as const

function toPlan(irritability: keyof typeof irritabilityLabels): FlowState {
  let state = toIrritability()
  shoulder.irritabilityQuestions.forEach((question, index) => {
    state = flowReducer(state, {
      type: 'ANSWER',
      questionId: question.id,
      value: irritabilityLabels[irritability][index],
    })
  })
  return flowReducer(state, { type: 'SUBMIT_STEP' })
}

describe('selecting a region', () => {
  it('selecting the shoulder goes to the red-flag questions', () => {
    const state = flowReducer(initialState, {
      type: 'SELECT_REGION',
      regionId: 'shoulder',
    })
    expect(state).toEqual({
      step: 'redFlags',
      regionId: 'shoulder',
      answers: {},
    })
  })

  it('selecting a region that is not registered is ignored', () => {
    expect(
      flowReducer(initialState, { type: 'SELECT_REGION', regionId: 'knee' }),
    ).toBe(initialState)
  })
})

describe('the red-flag screen', () => {
  it('any red flag answered yes goes to the referral screen', () => {
    for (const target of shoulder.redFlags) {
      let state = toRedFlags()
      for (const flag of shoulder.redFlags) {
        state = flowReducer(state, {
          type: 'ANSWER',
          questionId: flag.id,
          value: flag.id === target.id,
        })
      }
      state = flowReducer(state, { type: 'SUBMIT_STEP' })
      expect(state).toEqual({
        step: 'referral',
        regionId: 'shoulder',
        flag: target,
      })
    }
  })

  it('all red flags answered no go to the exclusion questions', () => {
    const state = flowReducer(toRedFlagsAnswered(false), {
      type: 'SUBMIT_STEP',
    })
    expect(state).toEqual({ step: 'scope', regionId: 'shoulder', answers: {} })
  })

  it('several red flags answered yes refer to the most urgent one', () => {
    let state = toRedFlags()
    for (const flag of shoulder.redFlags) {
      state = flowReducer(state, {
        type: 'ANSWER',
        questionId: flag.id,
        value: flag.id === 'trauma' || flag.id === 'cardiac',
      })
    }
    state = flowReducer(state, { type: 'SUBMIT_STEP' })
    expect(state).toEqual({
      step: 'referral',
      regionId: 'shoulder',
      flag: expect.objectContaining({ id: 'cardiac', urgency: 'emergency' }),
    })
  })

  it('submitting with unanswered questions stays on the screen', () => {
    let state = toRedFlags()
    for (const flag of shoulder.redFlags.slice(0, 3)) {
      state = flowReducer(state, {
        type: 'ANSWER',
        questionId: flag.id,
        value: true,
      })
    }
    expect(flowReducer(state, { type: 'SUBMIT_STEP' })).toBe(state)
  })

  it('a back from the red flags goes to the body map', () => {
    expect(flowReducer(toRedFlags(), { type: 'BACK' })).toEqual({ step: 'map' })
  })

  it('an answer to a question that is not on this screen is ignored', () => {
    const state = toRedFlags()
    expect(
      flowReducer(state, {
        type: 'ANSWER',
        questionId: 'surgery',
        value: true,
      }),
    ).toBe(state)
  })
})

describe('the exclusion screen', () => {
  it('any exclusion answered yes goes to the out-of-scope screen', () => {
    for (const target of shoulder.exclusions) {
      let state = toExclusions()
      for (const question of shoulder.exclusions) {
        state = flowReducer(state, {
          type: 'ANSWER',
          questionId: question.id,
          value: question.id === target.id,
        })
      }
      state = flowReducer(state, { type: 'SUBMIT_STEP' })
      expect(state).toEqual({
        step: 'outOfScope',
        regionId: 'shoulder',
        reason: target,
      })
    }
  })

  it('exclusions answered no go to the irritability questions', () => {
    let state = toExclusions()
    for (const question of shoulder.exclusions) {
      state = flowReducer(state, {
        type: 'ANSWER',
        questionId: question.id,
        value: false,
      })
    }
    expect(flowReducer(state, { type: 'SUBMIT_STEP' })).toEqual({
      step: 'irritability',
      regionId: 'shoulder',
      answers: [],
    })
  })

  it('submitting with an unanswered exclusion stays on the screen', () => {
    let state = toExclusions()
    state = flowReducer(state, {
      type: 'ANSWER',
      questionId: 'surgery',
      value: false,
    })
    expect(flowReducer(state, { type: 'SUBMIT_STEP' })).toBe(state)
  })

  it('a back from the exclusions goes to the red flags', () => {
    expect(flowReducer(toExclusions(), { type: 'BACK' })).toEqual({
      step: 'redFlags',
      regionId: 'shoulder',
      answers: {},
    })
  })
})

describe('the referral and out-of-scope screens', () => {
  it('the referral screen only restarts the flow', () => {
    const state = flowReducer(toRedFlagsAnswered(true), { type: 'SUBMIT_STEP' })
    expect(state.step).toBe('referral')
    expect(flowReducer(state, { type: 'SUBMIT_STEP' })).toBe(state)
    expect(flowReducer(state, { type: 'BACK' })).toBe(state)
    expect(
      flowReducer(state, {
        type: 'ANSWER',
        questionId: 'cardiac',
        value: true,
      }),
    ).toBe(state)
    expect(flowReducer(state, { type: 'RESTART' })).toEqual({ step: 'map' })
  })

  it('the out-of-scope screen only restarts the flow', () => {
    let state = toExclusions()
    state = flowReducer(state, {
      type: 'ANSWER',
      questionId: 'surgery',
      value: true,
    })
    state = flowReducer(state, {
      type: 'ANSWER',
      questionId: 'passiveRom',
      value: false,
    })
    const outOfScope = flowReducer(state, { type: 'SUBMIT_STEP' })
    expect(outOfScope.step).toBe('outOfScope')
    expect(flowReducer(outOfScope, { type: 'SUBMIT_STEP' })).toBe(outOfScope)
    expect(flowReducer(outOfScope, { type: 'RESTART' })).toEqual({
      step: 'map',
    })
  })
})

describe('the irritability questions', () => {
  it('high irritability starts the plan at level 1', () => {
    expect(toPlan('high')).toEqual({
      step: 'plan',
      regionId: 'shoulder',
      current: { level: 1, load: 'normal' },
    })
  })

  it('moderate irritability starts the plan at level 2', () => {
    expect(toPlan('moderate')).toEqual({
      step: 'plan',
      regionId: 'shoulder',
      current: { level: 2, load: 'normal' },
    })
  })

  it('low irritability starts the plan at level 2', () => {
    expect(toPlan('low')).toEqual({
      step: 'plan',
      regionId: 'shoulder',
      current: { level: 2, load: 'normal' },
    })
  })

  it('submitting with an unanswered question stays on the screen', () => {
    let state = toIrritability()
    state = flowReducer(state, {
      type: 'ANSWER',
      questionId: 'painAtRest',
      value: 'Yes',
    })
    expect(flowReducer(state, { type: 'SUBMIT_STEP' })).toBe(state)
  })

  it('an answer with an option that is not on the question is ignored', () => {
    const state = toIrritability()
    expect(
      flowReducer(state, {
        type: 'ANSWER',
        questionId: 'painAfterActivity',
        value: 'Sometimes',
      }),
    ).toBe(state)
  })

  it('a back from the irritability questions goes to the exclusions', () => {
    expect(flowReducer(toIrritability(), { type: 'BACK' })).toEqual({
      step: 'scope',
      regionId: 'shoulder',
      answers: {},
    })
  })
})

describe('the plan and the weekly check-in', () => {
  it('the plan screen goes to the weekly check-in', () => {
    const state: FlowState = {
      step: 'plan',
      regionId: 'shoulder',
      current: { level: 2, load: 'reduced' },
    }
    expect(flowReducer(state, { type: 'SUBMIT_STEP' })).toEqual({
      step: 'checkIn',
      regionId: 'shoulder',
      current: { level: 2, load: 'reduced' },
    })
  })

  it('a good check-in at level 1 levels up to level 2', () => {
    const state: FlowState = {
      step: 'checkIn',
      regionId: 'shoulder',
      current: { level: 1, load: 'normal' },
    }
    expect(
      flowReducer(state, { type: 'SUBMIT_CHECK_IN', checkIn: goodCheckIn }),
    ).toEqual({
      step: 'plan',
      regionId: 'shoulder',
      current: { level: 2, load: 'normal' },
    })
  })

  it('a flare at normal load keeps the level and reduces the load', () => {
    const state: FlowState = {
      step: 'checkIn',
      regionId: 'shoulder',
      current: { level: 2, load: 'normal' },
    }
    const flare: CheckIn = { ...goodCheckIn, painDuring: 6 }
    expect(
      flowReducer(state, { type: 'SUBMIT_CHECK_IN', checkIn: flare }),
    ).toEqual({
      step: 'plan',
      regionId: 'shoulder',
      current: { level: 2, load: 'reduced' },
    })
  })

  it('a good check-in at level 3 stays at level 3', () => {
    const state: FlowState = {
      step: 'checkIn',
      regionId: 'shoulder',
      current: { level: 3, load: 'normal' },
    }
    expect(
      flowReducer(state, { type: 'SUBMIT_CHECK_IN', checkIn: goodCheckIn }),
    ).toEqual({
      step: 'plan',
      regionId: 'shoulder',
      current: { level: 3, load: 'normal' },
    })
  })

  it('a check-in that is neither a flare nor a good response keeps level and load', () => {
    const state: FlowState = {
      step: 'checkIn',
      regionId: 'shoulder',
      current: { level: 2, load: 'normal' },
    }
    const notEnough: CheckIn = { ...goodCheckIn, allSetsCompleted: false }
    expect(
      flowReducer(state, { type: 'SUBMIT_CHECK_IN', checkIn: notEnough }),
    ).toEqual({
      step: 'plan',
      regionId: 'shoulder',
      current: { level: 2, load: 'normal' },
    })
  })

  it('walking through the whole flow from the map ends back on the plan screen', () => {
    let state = initialState
    state = flowReducer(state, { type: 'SELECT_REGION', regionId: 'shoulder' })
    for (const flag of shoulder.redFlags) {
      state = flowReducer(state, {
        type: 'ANSWER',
        questionId: flag.id,
        value: false,
      })
    }
    state = flowReducer(state, { type: 'SUBMIT_STEP' })
    for (const question of shoulder.exclusions) {
      state = flowReducer(state, {
        type: 'ANSWER',
        questionId: question.id,
        value: false,
      })
    }
    state = flowReducer(state, { type: 'SUBMIT_STEP' })
    shoulder.irritabilityQuestions.forEach((question, index) => {
      state = flowReducer(state, {
        type: 'ANSWER',
        questionId: question.id,
        value: irritabilityLabels.low[index],
      })
    })
    state = flowReducer(state, { type: 'SUBMIT_STEP' })
    expect(state).toEqual({
      step: 'plan',
      regionId: 'shoulder',
      current: { level: 2, load: 'normal' },
    })
    state = flowReducer(state, { type: 'SUBMIT_STEP' })
    expect(state).toEqual({
      step: 'checkIn',
      regionId: 'shoulder',
      current: { level: 2, load: 'normal' },
    })
    state = flowReducer(state, {
      type: 'SUBMIT_CHECK_IN',
      checkIn: goodCheckIn,
    })
    expect(state).toEqual({
      step: 'plan',
      regionId: 'shoulder',
      current: { level: 3, load: 'normal' },
    })
  })

  it('a back from the check-in goes back to the plan', () => {
    const state: FlowState = {
      step: 'checkIn',
      regionId: 'shoulder',
      current: { level: 2, load: 'normal' },
    }
    expect(flowReducer(state, { type: 'BACK' })).toEqual({
      step: 'plan',
      regionId: 'shoulder',
      current: { level: 2, load: 'normal' },
    })
  })

  it('a back from the plan goes to the irritability questions', () => {
    const state: FlowState = {
      step: 'plan',
      regionId: 'shoulder',
      current: { level: 1, load: 'normal' },
    }
    expect(flowReducer(state, { type: 'BACK' })).toEqual({
      step: 'irritability',
      regionId: 'shoulder',
      answers: [],
    })
  })

  it('a check-in submitted anywhere else is ignored', () => {
    expect(
      flowReducer(initialState, {
        type: 'SUBMIT_CHECK_IN',
        checkIn: goodCheckIn,
      }),
    ).toBe(initialState)
  })

  it('a restart from any screen goes to the body map', () => {
    const screens: FlowState[] = [
      initialState,
      toRedFlags(),
      toIrritability(),
      toPlan('high'),
      { step: 'referral', regionId: 'shoulder', flag: shoulder.redFlags[0] },
      {
        step: 'outOfScope',
        regionId: 'shoulder',
        reason: shoulder.exclusions[0],
      },
      {
        step: 'checkIn',
        regionId: 'shoulder',
        current: { level: 2, load: 'normal' },
      },
    ]
    for (const screen of screens) {
      expect(flowReducer(screen, { type: 'RESTART' })).toEqual({ step: 'map' })
    }
  })
})
