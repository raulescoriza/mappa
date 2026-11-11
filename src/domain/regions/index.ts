import type { Region } from '../types'
import { shoulder } from './shoulder'

export const regions: readonly Region[] = [shoulder]

export function isRegisteredRegion(id: string): boolean {
  return regions.some((entry) => entry.id === id)
}

export function getRegion(id: string): Region {
  const region = regions.find((entry) => entry.id === id)
  if (region === undefined) throw new Error(`Unknown region: "${id}"`)
  return region
}
