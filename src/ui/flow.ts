import {
  checkScope,
  classifyIrritability,
  evaluateCheckIn,
  screenRedFlags,
  startingLevel,
} from '../domain/engine'
import { getRegion, isRegisteredRegion } from '../domain/regions'
import type {
  CheckIn,
  CheckInDecision,
  ExclusionAnswers,
  ExclusionQuestion,
  IrritabilityAnswer,
  LevelState,
  RedFlag,
  RedFlagAnswers,
} from '../domain/types'

export type FlowState =
  | { step: 'map' }
  | { step: 'redFlags'; regionId: string; answers: RedFlagAnswers }
  | { step: 'scope'; regionId: string; answers: ExclusionAnswers }
  | { step: 'referral'; regionId: string; flag: RedFlag }
  | { step: 'outOfScope'; regionId: string; reason: ExclusionQuestion }
  | { step: 'irritability'; regionId: string; answers: IrritabilityAnswer[] }
  | {
      step: 'plan'
      regionId: string
      current: LevelState
      lastDecision?: CheckInDecision
    }
  | {
      step: 'checkIn'
      regionId: string
      current: LevelState
      lastDecision?: CheckInDecision
    }

export type FlowEvent =
  | { type: 'SELECT_REGION'; regionId: string }
  | { type: 'ANSWER'; questionId: string; value: string | boolean }
  | { type: 'SUBMIT_STEP' }
  | { type: 'SUBMIT_CHECK_IN'; checkIn: CheckIn }
  | { type: 'BACK' }
  | { type: 'RESTART' }

export const initialState: FlowState = { step: 'map' }

export function flowReducer(state: FlowState, event: FlowEvent): FlowState {
  if (event.type === 'RESTART') return initialState

  switch (state.step) {
    case 'map': {
      if (
        event.type === 'SELECT_REGION' &&
        isRegisteredRegion(event.regionId)
      ) {
        return { step: 'redFlags', regionId: event.regionId, answers: {} }
      }
      return state
    }

    case 'redFlags': {
      const region = getRegion(state.regionId)
      if (event.type === 'ANSWER' && typeof event.value === 'boolean') {
        if (!region.redFlags.some((flag) => flag.id === event.questionId))
          return state
        return {
          ...state,
          answers: { ...state.answers, [event.questionId]: event.value },
        }
      }
      if (event.type === 'SUBMIT_STEP') {
        if (!region.redFlags.every((flag) => flag.id in state.answers))
          return state
        const result = screenRedFlags(region, state.answers)
        if (result.result === 'refer') {
          return {
            step: 'referral',
            regionId: state.regionId,
            flag: result.flag,
          }
        }
        return { step: 'scope', regionId: state.regionId, answers: {} }
      }
      if (event.type === 'BACK') return { step: 'map' }
      return state
    }

    case 'scope': {
      const region = getRegion(state.regionId)
      if (event.type === 'ANSWER' && typeof event.value === 'boolean') {
        if (
          !region.exclusions.some(
            (question) => question.id === event.questionId,
          )
        )
          return state
        return {
          ...state,
          answers: { ...state.answers, [event.questionId]: event.value },
        }
      }
      if (event.type === 'SUBMIT_STEP') {
        if (
          !region.exclusions.every((question) => question.id in state.answers)
        )
          return state
        const result = checkScope(region, state.answers)
        if (result.result === 'outOfScope') {
          return {
            step: 'outOfScope',
            regionId: state.regionId,
            reason: result.reason,
          }
        }
        return { step: 'irritability', regionId: state.regionId, answers: [] }
      }
      if (event.type === 'BACK') {
        return { step: 'redFlags', regionId: state.regionId, answers: {} }
      }
      return state
    }

    case 'referral':
    case 'outOfScope':
      return state

    case 'irritability': {
      const region = getRegion(state.regionId)
      if (event.type === 'ANSWER' && typeof event.value === 'string') {
        const question = region.irritabilityQuestions.find(
          (q) => q.id === event.questionId,
        )
        if (question === undefined) return state
        if (!question.options.some((option) => option.label === event.value))
          return state
        const answers = [
          ...state.answers.filter(
            (answer) => answer.questionId !== event.questionId,
          ),
          { questionId: event.questionId, label: event.value },
        ]
        return { ...state, answers }
      }
      if (event.type === 'SUBMIT_STEP') {
        const allAnswered = region.irritabilityQuestions.every((question) =>
          state.answers.some((answer) => answer.questionId === question.id),
        )
        if (!allAnswered) return state
        const irritability = classifyIrritability(region, state.answers)
        const level = startingLevel(region, irritability)
        return {
          step: 'plan',
          regionId: state.regionId,
          current: { level, load: 'normal' },
        }
      }
      if (event.type === 'BACK') {
        return { step: 'scope', regionId: state.regionId, answers: {} }
      }
      return state
    }

    case 'plan': {
      if (event.type === 'SUBMIT_STEP') {
        return {
          step: 'checkIn',
          regionId: state.regionId,
          current: state.current,
          lastDecision: state.lastDecision,
        }
      }
      if (event.type === 'BACK') {
        return { step: 'irritability', regionId: state.regionId, answers: [] }
      }
      return state
    }

    case 'checkIn': {
      const region = getRegion(state.regionId)
      if (event.type === 'SUBMIT_CHECK_IN') {
        const result = evaluateCheckIn(region, state.current, event.checkIn)
        return {
          step: 'plan',
          regionId: state.regionId,
          current: result.next,
          lastDecision: result.decision,
        }
      }
      if (event.type === 'BACK') {
        return {
          step: 'plan',
          regionId: state.regionId,
          current: state.current,
          lastDecision: state.lastDecision,
        }
      }
      return state
    }
  }
}
