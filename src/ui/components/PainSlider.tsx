import { useId } from 'react'

export function PainSlider({
  value,
  onChange,
  lowLabel = 'No pain',
  highLabel = 'Worst pain',
}: {
  value: number
  onChange: (value: number) => void
  lowLabel?: string
  highLabel?: string
}) {
  const id = useId()
  return (
    <div className="card pain-slider">
      <label className="question-text" htmlFor={id}>
        Pain during the exercises
      </label>
      <p className="pain-value">{value}/10</p>
      <input
        id={id}
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        aria-valuetext={`${value} out of 10`}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="pain-scale">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  )
}
