import { PrimaryButton } from '../components/PrimaryButton'
import { Screen } from '../components/Screen'
import type { ExclusionQuestion } from '../../domain/types'
import type { FlowEvent } from '../flow'

type Dispatch = (event: FlowEvent) => void

export function OutOfScopeScreen({
  reason,
  dispatch,
}: {
  reason: ExclusionQuestion
  dispatch: Dispatch
}) {
  return (
    <Screen title="It is best to be seen in person" tone="out">
      <div className="card">
        <p className="outcome-copy">{reason.outcomeCopy}</p>
      </div>
      <PrimaryButton onClick={() => dispatch({ type: 'RESTART' })}>
        Start over
      </PrimaryButton>
    </Screen>
  )
}
