import type { ReactNode } from 'react'

export type ChipVariant = 'accent' | 'primary' | 'neutral'

export function Chip({
  variant = 'neutral',
  strong = false,
  children,
}: {
  variant?: ChipVariant
  strong?: boolean
  children: ReactNode
}) {
  const className = strong
    ? `chip chip-${variant} chip-strong`
    : `chip chip-${variant}`
  return <span className={className}>{children}</span>
}
