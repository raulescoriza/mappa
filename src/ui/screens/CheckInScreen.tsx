import { useState } from 'react'

import { Chip } from '../components/Chip'
import { ChoiceQuestion } from '../components/ChoiceQuestion'
import { PainSlider } from '../components/PainSlider'
import { PrimaryButton } from '../components/PrimaryButton'
import { Screen } from '../components/Screen'
import { YesNoQuestion } from '../components/YesNoQuestion'
import type { CheckIn, LevelState } from '../../domain/types'
import type { FlowEvent } from '../flow'

type Dispatch = (event: FlowEvent) => void

export function CheckInScreen({
  current,
  dispatch,
}: {
  current: LevelState
  dispatch: Dispatch
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
    <Screen
      title="Weekly check-in"
      step={4}
      tone="decision"
      onBack={() => dispatch({ type: 'BACK' })}
    >
      <div className="chip-row">
        <Chip variant="primary">Level {current.level}</Chip>
        {current.load === 'reduced' && (
          <Chip variant="accent">Reduced load</Chip>
        )}
      </div>
      <PainSlider value={painDuring} onChange={setPainDuring} />
      <ChoiceQuestion
        question="Next morning, compared with your usual:"
        options={['Better or the same', 'Worse']}
        value={nextMorning === 'betterOrSame' ? 'Better or the same' : 'Worse'}
        onChange={(label) =>
          setNextMorning(label === 'Worse' ? 'worse' : 'betterOrSame')
        }
      />
      <YesNoQuestion
        question="Completed all sets without shrugging the shoulder?"
        value={allSetsCompleted}
        onChange={setAllSetsCompleted}
      />
      <YesNoQuestion
        question="Worse the next morning in two sessions in a row?"
        value={worseNextMorningTwice}
        onChange={setWorseNextMorningTwice}
      />
      <PrimaryButton onClick={submit}>Save check-in</PrimaryButton>
    </Screen>
  )
}
