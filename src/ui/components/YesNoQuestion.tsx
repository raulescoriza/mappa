import { useId } from 'react'

const options = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
] as const

export function YesNoQuestion({
  question,
  value,
  onChange,
}: {
  question: string
  value?: boolean
  onChange: (value: boolean) => void
}) {
  const name = useId()
  const labelId = useId()
  return (
    <fieldset className="card question" aria-labelledby={labelId}>
      <p className="question-text" id={labelId}>{question}</p>
      <div className="pill-row">
        {options.map((option) => (
          <label key={option.label} className="pill">
            <input
              type="radio"
              name={name}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
