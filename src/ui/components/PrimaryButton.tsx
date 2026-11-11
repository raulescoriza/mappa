import type { ReactNode } from 'react'

export function PrimaryButton({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
}: {
  children: ReactNode
  onClick: () => void
  variant?: 'primary' | 'accent'
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      className={`btn-primary btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
