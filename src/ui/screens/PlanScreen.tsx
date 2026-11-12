import { Chip } from '../components/Chip'
import { ExerciseCard } from '../components/ExerciseCard'
import { PrimaryButton } from '../components/PrimaryButton'
import { Screen } from '../components/Screen'
import type { CheckInDecision, LevelState, Region } from '../../domain/types'
import type { FlowEvent } from '../flow'

type Dispatch = (event: FlowEvent) => void

export function PlanScreen({
  region,
  current,
  lastDecision,
  dispatch,
}: {
  region: Region
  current: LevelState
  lastDecision?: CheckInDecision
  dispatch: Dispatch
}) {
  const level = region.levels.find((entry) => entry.number === current.level)
  if (level === undefined) return null
  const message =
    lastDecision === undefined
      ? undefined
      : region.checkInMessages[lastDecision]
  const messageTone =
    lastDecision === 'up' || lastDecision === 'restoreLoad'
      ? 'primary'
      : lastDecision === 'reduceLoad' || lastDecision === 'down'
        ? 'accent'
        : 'neutral'
  return (
    <Screen
      title={level.name}
      step={4}
      tone="decision"
      onBack={() => dispatch({ type: 'BACK' })}
    >
      <div className="chip-row">
        <Chip variant="primary">Level {current.level}</Chip>
        <Chip variant="neutral">{level.frequency}</Chip>
        {current.load === 'reduced' && (
          <Chip variant="accent">Reduced load</Chip>
        )}
      </div>
      {message !== undefined && (
        <p className={`plan-message tone-${messageTone}`}>{message}</p>
      )}
      {level.exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          name={exercise.name}
          dosage={
            current.load === 'reduced' ? level.reducedLoad : exercise.dosage
          }
          cue={exercise.cue}
        />
      ))}
      <p className="plan-note">{region.planNote}</p>
      <PrimaryButton onClick={() => dispatch({ type: 'SUBMIT_STEP' })}>
        Weekly check-in
      </PrimaryButton>
    </Screen>
  )
}
