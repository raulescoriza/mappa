import { PrimaryButton } from '../components/PrimaryButton'
import { Screen } from '../components/Screen'
import { YesNoQuestion } from '../components/YesNoQuestion'
import type { ExclusionAnswers, Region } from '../../domain/types'
import type { FlowEvent } from '../flow'

type Dispatch = (event: FlowEvent) => void

export function ScopeScreen({
  region,
  answers,
  dispatch,
}: {
  region: Region
  answers: ExclusionAnswers
  dispatch: Dispatch
}) {
  return (
    <Screen
      title="Two more quick questions"
      step={2}
      onBack={() => dispatch({ type: 'BACK' })}
    >
      {region.exclusions.map((question) => (
        <YesNoQuestion
          key={question.id}
          question={question.question}
          value={answers[question.id]}
          onChange={(value) =>
            dispatch({ type: 'ANSWER', questionId: question.id, value })
          }
        />
      ))}
      <PrimaryButton onClick={() => dispatch({ type: 'SUBMIT_STEP' })}>
        Check answers
      </PrimaryButton>
    </Screen>
  )
}
