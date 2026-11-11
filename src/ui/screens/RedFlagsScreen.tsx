import { PrimaryButton } from '../components/PrimaryButton'
import { Screen } from '../components/Screen'
import { YesNoQuestion } from '../components/YesNoQuestion'
import type { Region, RedFlagAnswers } from '../../domain/types'
import type { FlowEvent } from '../flow'

type Dispatch = (event: FlowEvent) => void

export function RedFlagsScreen({
  region,
  answers,
  dispatch,
}: {
  region: Region
  answers: RedFlagAnswers
  dispatch: Dispatch
}) {
  return (
    <Screen
      title="First, a few safety questions"
      step={1}
      tone="stop"
      onBack={() => dispatch({ type: 'BACK' })}
    >
      {region.redFlags.map((flag) => (
        <YesNoQuestion
          key={flag.id}
          question={flag.question}
          value={answers[flag.id]}
          onChange={(value) =>
            dispatch({ type: 'ANSWER', questionId: flag.id, value })
          }
        />
      ))}
      <PrimaryButton onClick={() => dispatch({ type: 'SUBMIT_STEP' })}>
        Check answers
      </PrimaryButton>
    </Screen>
  )
}
