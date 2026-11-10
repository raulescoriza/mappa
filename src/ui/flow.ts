import {
  checkScope,
  classifyIrritability,
  evaluateCheckIn,
  screenRedFlags,
  startingLevel,
} from '../domain/engine'
import { shoulder } from '../domain/regions/shoulder'
import type {
  CheckIn,
  ExclusionAnswers,
  ExclusionQuestion,
  IrritabilityAnswer,
  LevelState,
  RedFlag,
  RedFlagAnswers,
} from '../domain/types'

export type FlowState =
  | { step: 'map' }
  | { step: 'redFlags'; answers: RedFlagAnswers }
  | { step: 'scope'; answers: ExclusionAnswers }
  | { step: 'referral'; flag: RedFlag }
  | { step: 'outOfScope'; reason: ExclusionQuestion }
  | { step: 'irritability'; answers: IrritabilityAnswer[] }
  | { step: 'plan'; current: LevelState }
  | { step: 'checkIn'; current: LevelState }

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
      if (event.type === 'SELECT_REGION' && event.regionId === shoulder.id) {
        return { step: 'redFlags', answers: {} }
      }
      return state
    }

    case 'redFlags': {
      if (event.type === 'ANSWER' && typeof event.value === 'boolean') {
        if (!shoulder.redFlags.some((flag) => flag.id === event.questionId))
          return state
        return {
          ...state,
          answers: { ...state.answers, [event.questionId]: event.value },
        }
      }
      if (event.type === 'SUBMIT_STEP') {
        if (!shoulder.redFlags.every((flag) => flag.id in state.answers))
          return state
        const result = screenRedFlags(shoulder, state.answers)
        if (result.result === 'refer')
          return { step: 'referral', flag: result.flag }
        return { step: 'scope', answers: {} }
      }
      if (event.type === 'BACK') return { step: 'map' }
      return state
    }

    case 'scope': {
      if (event.type === 'ANSWER' && typeof event.value === 'boolean') {
        if (
          !shoulder.exclusions.some(
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
          !shoulder.exclusions.every((question) => question.id in state.answers)
        )
          return state
        const result = checkScope(shoulder, state.answers)
        if (result.result === 'outOfScope')
          return { step: 'outOfScope', reason: result.reason }
        return { step: 'irritability', answers: [] }
      }
      if (event.type === 'BACK') return { step: 'redFlags', answers: {} }
      return state
    }

    case 'referral':
    case 'outOfScope':
      return state

    case 'irritability': {
      if (event.type === 'ANSWER' && typeof event.value === 'string') {
        const question = shoulder.irritabilityQuestions.find(
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
        const allAnswered = shoulder.irritabilityQuestions.every((question) =>
          state.answers.some((answer) => answer.questionId === question.id),
        )
        if (!allAnswered) return state
        const irritability = classifyIrritability(shoulder, state.answers)
        const level = startingLevel(shoulder, irritability)
        return { step: 'plan', current: { level, load: 'normal' } }
      }
      if (event.type === 'BACK') return { step: 'scope', answers: {} }
      return state
    }

    case 'plan': {
      if (event.type === 'SUBMIT_STEP')
        return { step: 'checkIn', current: state.current }
      if (event.type === 'BACK') return { step: 'irritability', answers: [] }
      return state
    }

    case 'checkIn': {
      if (event.type === 'SUBMIT_CHECK_IN') {
        const result = evaluateCheckIn(shoulder, state.current, event.checkIn)
        return { step: 'plan', current: result.next }
      }
      if (event.type === 'BACK') return { step: 'plan', current: state.current }
      return state
    }
  }
}
