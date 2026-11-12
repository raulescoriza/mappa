import { ChoiceQuestion } from '../components/ChoiceQuestion'
import { PrimaryButton } from '../components/PrimaryButton'
import { Screen } from '../components/Screen'
import type { IrritabilityAnswer, Region } from '../../domain/types'
import type { FlowEvent } from '../flow'

type Dispatch = (event: FlowEvent) => void

export function IrritabilityScreen({
  region,
  answers,
  dispatch,
}: {
  region: Region
  answers: IrritabilityAnswer[]
  dispatch: Dispatch
}) {
  return (
    <Screen
      title="How is the shoulder behaving?"
      step={3}
      tone="decision"
      onBack={() => dispatch({ type: 'BACK' })}
    >
      {region.irritabilityQuestions.map((question) => (
        <ChoiceQuestion
          key={question.id}
          question={question.question}
          options={question.options.map((option) => option.label)}
          value={
            answers.find((answer) => answer.questionId === question.id)?.label
          }
          onChange={(label) =>
            dispatch({ type: 'ANSWER', questionId: question.id, value: label })
          }
        />
      ))}
      <PrimaryButton onClick={() => dispatch({ type: 'SUBMIT_STEP' })}>
        Show my plan
      </PrimaryButton>
    </Screen>
  )
}
