import { Chip } from '../components/Chip'
import { PrimaryButton } from '../components/PrimaryButton'
import { Screen } from '../components/Screen'
import type { RedFlag } from '../../domain/types'
import type { FlowEvent } from '../flow'

type Dispatch = (event: FlowEvent) => void

const urgencyLabels: Record<RedFlag['urgency'], string> = {
  emergency: 'Emergency',
  urgent: 'Urgent',
  gp: 'GP',
  doctor: 'Doctor',
}

export function ReferralScreen({
  flag,
  dispatch,
}: {
  flag: RedFlag
  dispatch: Dispatch
}) {
  return (
    <Screen title="Please do not start the exercises yet" tone="stop">
      <div className="card referral-card">
        <Chip variant="accent" strong={flag.urgency === 'emergency'}>
          {urgencyLabels[flag.urgency]}
        </Chip>
        <p className="referral-copy">{flag.referralCopy}</p>
      </div>
      <PrimaryButton
        variant="accent"
        onClick={() => dispatch({ type: 'RESTART' })}
      >
        Start over
      </PrimaryButton>
    </Screen>
  )
}
