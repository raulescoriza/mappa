import { isRegisteredRegion } from '../../domain/regions'
import { regionList } from '../bodyMap/shapes'
import type { BodySide, RegionId } from '../bodyMap/shapes'
import { Chip } from './Chip'

export type SelectedRegion = { regionId: RegionId; side: BodySide } | null

function sideName(name: string, side: BodySide): string {
  if (side === 'right') return `Right ${name}`
  if (side === 'left') return `Left ${name}`
  return name
}

// The accessible alternative to the body map: every region, head to toe.
// Available regions are tinted rows; the shoulder (the only available region
// with two sides) offers a right / left choice. Coming-soon regions are muted
// and not clickable. Availability is decided by the region registry.
export function RegionList({
  selected,
  onSelect,
}: {
  selected: SelectedRegion
  onSelect: (regionId: RegionId, side: BodySide) => void
}) {
  return (
    <ul className="region-list" role="list">
      {regionList.map((item) => {
        const available = isRegisteredRegion(item.regionId)
        const selectedHere = selected !== null && selected.regionId === item.regionId

        if (available) {
          return (
            <li key={item.regionId} className="region-list-item is-available">
              <span className="region-list-name">
                {item.name} <Chip variant="primary">Available</Chip>
              </span>
              {item.sides.length > 0 && (
                <div className="region-list-sides" role="group" aria-label={item.name}>
                  {item.sides.map((side) => {
                    if (side === 'center') return null
                    const s = side as BodySide
                    const isSelected = selectedHere && selected!.side === s
                    return (
                      <button
                        key={s}
                        type="button"
                        className={`region-list-side${isSelected ? ' is-selected' : ''}`}
                        aria-pressed={isSelected}
                        onClick={() => onSelect(item.regionId, s)}
                      >
                        {sideName(item.name, s)}
                      </button>
                    )
                  })}
                </div>
              )}
            </li>
          )
        }

        return (
          <li key={item.regionId} className="region-list-item is-soon">
            <span className="region-list-name">
              {item.name} <Chip variant="neutral">Coming soon</Chip>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
