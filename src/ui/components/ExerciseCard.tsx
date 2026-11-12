export function ExerciseCard({
  name,
  dosage,
  cue,
}: {
  name: string
  dosage: string
  cue: string
}) {
  return (
    <article className="card exercise">
      <div className="exercise-video">
        <span className="video-thumb" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 12 12">
            <path d="M2 1.5v9l8-4.5z" fill="currentColor" />
          </svg>
        </span>
        <p className="video-state">Avatar demo · in development</p>
      </div>
      <h3 className="exercise-name">{name}</h3>
      <p className="exercise-dosage">{dosage}</p>
      <p className="exercise-cue">{cue}</p>
    </article>
  )
}
