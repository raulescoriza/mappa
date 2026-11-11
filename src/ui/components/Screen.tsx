import type { ReactNode } from 'react'

export type ScreenTone = 'step' | 'decision' | 'stop' | 'out'

export function Screen({
  title,
  step,
  tone = 'step',
  onBack,
  children,
}: {
  title: string
  step?: number
  tone?: ScreenTone
  onBack?: () => void
  children: ReactNode
}) {
  return (
    <div className={`screen tone-${tone}`}>
      {step !== undefined && <p className="eyebrow">Step {step} of 4</p>}
      <h1 className="screen-title">{title}</h1>
      <div className="screen-body">{children}</div>
      {onBack !== undefined && (
        <button type="button" className="btn-ghost" onClick={onBack}>
          ← Back
        </button>
      )}
    </div>
  )
}
