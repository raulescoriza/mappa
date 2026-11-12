import { useId } from 'react'

export function ChoiceQuestion({
  question,
  options,
  value,
  onChange,
}: {
  question: string
  options: string[]
  value?: string
  onChange: (label: string) => void
}) {
  const name = useId()
  const labelId = useId()
  return (
    <fieldset className="card question" aria-labelledby={labelId}>
      <p className="question-text" id={labelId}>{question}</p>
      <div className="pill-row">
        {options.map((label) => (
          <label key={label} className="pill">
            <input
              type="radio"
              name={name}
              checked={value === label}
              onChange={() => onChange(label)}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
