import { useReducer, useState } from 'react'

import { shoulder } from './domain/regions/shoulder'
import type {
  CheckIn,
  ExclusionAnswers,
  ExclusionQuestion,
  IrritabilityAnswer,
  Level,
  LevelState,
  RedFlag,
  RedFlagAnswers,
} from './domain/types'
import { flowReducer, initialState } from './ui/flow'
import type { FlowEvent } from './ui/flow'

type Dispatch = (event: FlowEvent) => void

function MapScreen({ dispatch }: { dispatch: Dispatch }) {
  return (
    <section>
      <h1 className="app-title">Mappa</h1>
      <p>Where is the pain? Choose a region to begin.</p>
      <button
        type="button"
        onClick={() =>
          dispatch({ type: 'SELECT_REGION', regionId: 'shoulder' })
        }
      >
        Left shoulder
      </button>
      <button
        type="button"
        onClick={() =>
          dispatch({ type: 'SELECT_REGION', regionId: 'shoulder' })
        }
      >
        Right shoulder
      </button>
      <button type="button" disabled>
        Neck (coming soon)
      </button>
      <button type="button" disabled>
        Lower back (coming soon)
      </button>
    </section>
  )
}

function RedFlagsScreen({
  dispatch,
  answers,
}: {
  dispatch: Dispatch
  answers: RedFlagAnswers
}) {
  return (
    <section>
      <h1>First, a few safety questions</h1>
      {shoulder.redFlags.map((flag) => (
        <fieldset key={flag.id}>
          <legend>{flag.question}</legend>
          <label>
            <input
              type="radio"
              name={flag.id}
              checked={answers[flag.id] === true}
              onChange={() =>
                dispatch({ type: 'ANSWER', questionId: flag.id, value: true })
              }
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name={flag.id}
              checked={answers[flag.id] === false}
              onChange={() =>
                dispatch({ type: 'ANSWER', questionId: flag.id, value: false })
              }
            />
            No
          </label>
        </fieldset>
      ))}
      <button type="button" onClick={() => dispatch({ type: 'SUBMIT_STEP' })}>
        Check answers
      </button>
      <button type="button" onClick={() => dispatch({ type: 'BACK' })}>
        Back
      </button>
    </section>
  )
}

function ScopeScreen({
  dispatch,
  answers,
}: {
  dispatch: Dispatch
  answers: ExclusionAnswers
}) {
  return (
    <section>
      <h1>Two more quick questions</h1>
      {shoulder.exclusions.map((question) => (
        <fieldset key={question.id}>
          <legend>{question.question}</legend>
          <label>
            <input
              type="radio"
              name={question.id}
              checked={answers[question.id] === true}
              onChange={() =>
                dispatch({
                  type: 'ANSWER',
                  questionId: question.id,
                  value: true,
                })
              }
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name={question.id}
              checked={answers[question.id] === false}
              onChange={() =>
                dispatch({
                  type: 'ANSWER',
                  questionId: question.id,
                  value: false,
                })
              }
            />
            No
          </label>
        </fieldset>
      ))}
      <button type="button" onClick={() => dispatch({ type: 'SUBMIT_STEP' })}>
        Check answers
      </button>
      <button type="button" onClick={() => dispatch({ type: 'BACK' })}>
        Back
      </button>
    </section>
  )
}

function ReferralScreen({
  dispatch,
  flag,
}: {
  dispatch: Dispatch
  flag: RedFlag
}) {
  return (
    <section>
      <h1>Please do not start the exercises yet</h1>
      <p>{flag.referralCopy}</p>
      <button type="button" onClick={() => dispatch({ type: 'RESTART' })}>
        Start over
      </button>
    </section>
  )
}

function OutOfScopeScreen({
  dispatch,
  reason,
}: {
  dispatch: Dispatch
  reason: ExclusionQuestion
}) {
  return (
    <section>
      <h1>It is best to be seen in person</h1>
      <p>{reason.outcomeCopy}</p>
      <button type="button" onClick={() => dispatch({ type: 'RESTART' })}>
        Start over
      </button>
    </section>
  )
}

function IrritabilityScreen({
  dispatch,
  answers,
}: {
  dispatch: Dispatch
  answers: IrritabilityAnswer[]
}) {
  return (
    <section>
      <h1>How is the shoulder behaving?</h1>
      {shoulder.irritabilityQuestions.map((question) => (
        <fieldset key={question.id}>
          <legend>{question.question}</legend>
          {question.options.map((option) => {
            const selected =
              answers.find((answer) => answer.questionId === question.id)
                ?.label === option.label
            return (
              <label key={option.label}>
                <input
                  type="radio"
                  name={question.id}
                  checked={selected}
                  onChange={() =>
                    dispatch({
                      type: 'ANSWER',
                      questionId: question.id,
                      value: option.label,
                    })
                  }
                />
                {option.label}
              </label>
            )
          })}
        </fieldset>
      ))}
      <button type="button" onClick={() => dispatch({ type: 'SUBMIT_STEP' })}>
        Show my plan
      </button>
      <button type="button" onClick={() => dispatch({ type: 'BACK' })}>
        Back
      </button>
    </section>
  )
}

function PlanScreen({
  dispatch,
  current,
}: {
  dispatch: Dispatch
  current: LevelState
}) {
  const level: Level | undefined = shoulder.levels.find(
    (entry) => entry.number === current.level,
  )
  if (level === undefined) return null
  return (
    <section>
      <h1>{level.name}</h1>
      <p>
        Level {current.level} · {level.frequency}
        {current.load === 'reduced' ? ' · reduced load' : ''}
      </p>
      {current.load === 'reduced' && <p>Reduced load: {level.reducedLoad}</p>}
      {level.exercises.map((exercise) => (
        <article key={exercise.id}>
          <h2>{exercise.name}</h2>
          {current.load === 'normal' && <p>{exercise.dosage}</p>}
          <p>{exercise.cue}</p>
        </article>
      ))}
      <p>{shoulder.planNote}</p>
      <button type="button" onClick={() => dispatch({ type: 'SUBMIT_STEP' })}>
        Do my weekly check-in
      </button>
      <button type="button" onClick={() => dispatch({ type: 'BACK' })}>
        Back
      </button>
    </section>
  )
}

function CheckInScreen({
  dispatch,
  current,
}: {
  dispatch: Dispatch
  current: LevelState
}) {
  const [painDuring, setPainDuring] = useState(2)
  const [nextMorning, setNextMorning] =
    useState<CheckIn['nextMorning']>('betterOrSame')
  const [allSetsCompleted, setAllSetsCompleted] = useState(true)
  const [worseNextMorningTwice, setWorseNextMorningTwice] = useState(false)

  const submit = () =>
    dispatch({
      type: 'SUBMIT_CHECK_IN',
      checkIn: {
        painDuring,
        nextMorning,
        allSetsCompleted,
        worseNextMorningTwice,
      },
    })

  return (
    <section>
      <h1>Weekly check-in</h1>
      <p>
        Level {current.level}, {current.load} load.
      </p>
      <fieldset>
        <legend>Pain during the exercises, 0–10: {painDuring}</legend>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={painDuring}
          onChange={(event) => setPainDuring(Number(event.target.value))}
        />
      </fieldset>
      <fieldset>
        <legend>Next morning, compared with your usual:</legend>
        <label>
          <input
            type="radio"
            name="nextMorning"
            checked={nextMorning === 'betterOrSame'}
            onChange={() => setNextMorning('betterOrSame')}
          />
          Better or the same
        </label>
        <label>
          <input
            type="radio"
            name="nextMorning"
            checked={nextMorning === 'worse'}
            onChange={() => setNextMorning('worse')}
          />
          Worse
        </label>
      </fieldset>
      <fieldset>
        <legend>Completed all sets without shrugging the shoulder?</legend>
        <label>
          <input
            type="radio"
            name="allSets"
            checked={allSetsCompleted}
            onChange={() => setAllSetsCompleted(true)}
          />
          Yes
        </label>
        <label>
          <input
            type="radio"
            name="allSets"
            checked={!allSetsCompleted}
            onChange={() => setAllSetsCompleted(false)}
          />
          No
        </label>
      </fieldset>
      <fieldset>
        <legend>Worse the next morning in two sessions in a row?</legend>
        <label>
          <input
            type="radio"
            name="worseTwice"
            checked={worseNextMorningTwice}
            onChange={() => setWorseNextMorningTwice(true)}
          />
          Yes
        </label>
        <label>
          <input
            type="radio"
            name="worseTwice"
            checked={!worseNextMorningTwice}
            onChange={() => setWorseNextMorningTwice(false)}
          />
          No
        </label>
      </fieldset>
      <button type="button" onClick={submit}>
        Save check-in
      </button>
      <button type="button" onClick={() => dispatch({ type: 'BACK' })}>
        Back
      </button>
    </section>
  )
}

function App() {
  const [state, dispatch] = useReducer(flowReducer, initialState)

  return (
    <main className="app">
      {state.step === 'map' && <MapScreen dispatch={dispatch} />}
      {state.step === 'redFlags' && (
        <RedFlagsScreen dispatch={dispatch} answers={state.answers} />
      )}
      {state.step === 'scope' && (
        <ScopeScreen dispatch={dispatch} answers={state.answers} />
      )}
      {state.step === 'referral' && (
        <ReferralScreen dispatch={dispatch} flag={state.flag} />
      )}
      {state.step === 'outOfScope' && (
        <OutOfScopeScreen dispatch={dispatch} reason={state.reason} />
      )}
      {state.step === 'irritability' && (
        <IrritabilityScreen dispatch={dispatch} answers={state.answers} />
      )}
      {state.step === 'plan' && (
        <PlanScreen dispatch={dispatch} current={state.current} />
      )}
      {state.step === 'checkIn' && (
        <CheckInScreen dispatch={dispatch} current={state.current} />
      )}
      <p className="app-footer">
        Concept prototype. Not intended to diagnose, and not a substitute for an
        assessment by a healthcare professional.
      </p>
    </main>
  )
}

export default App
