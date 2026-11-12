import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { isRegisteredRegion } from '../../domain/regions'
import { shapesForView } from '../bodyMap/shapes'
import type {
  BodyShape,
  BodySide,
  BodyView,
  ShapeGeometry,
} from '../bodyMap/shapes'
import { Chip } from './Chip'
import { PrimaryButton } from './PrimaryButton'

// Decorative silhouette behind the region shapes, in map viewBox units.
const baseParts: ShapeGeometry[] = [
  { kind: 'ellipse', cx: 100, cy: 24, rx: 20, ry: 24 },
  { kind: 'rect', x: 92, y: 44, width: 16, height: 14, rx: 4 },
  { kind: 'rect', x: 60, y: 54, width: 80, height: 130, rx: 24 },
  { kind: 'rect', x: 60, y: 172, width: 80, height: 44, rx: 20 },
  { kind: 'rect', x: 34, y: 62, width: 22, height: 150, rx: 11 },
  { kind: 'rect', x: 144, y: 62, width: 22, height: 150, rx: 11 },
  { kind: 'rect', x: 62, y: 206, width: 34, height: 190, rx: 17 },
  { kind: 'rect', x: 104, y: 206, width: 34, height: 190, rx: 17 },
]

function BasePart({ geometry }: { geometry: ShapeGeometry }) {
  switch (geometry.kind) {
    case 'ellipse':
      return (
        <ellipse
          className="map-base"
          cx={geometry.cx}
          cy={geometry.cy}
          rx={geometry.rx}
          ry={geometry.ry}
        />
      )
    case 'rect':
      return (
        <rect
          className="map-base"
          x={geometry.x}
          y={geometry.y}
          width={geometry.width}
          height={geometry.height}
          rx={geometry.rx}
        />
      )
    case 'circle':
      return (
        <circle
          className="map-base"
          cx={geometry.cx}
          cy={geometry.cy}
          r={geometry.r}
        />
      )
  }
}

function shapeProps(
  shape: BodyShape,
  enabled: boolean,
  selected: boolean,
  onSelect: (shape: BodyShape) => void,
  onHover: (shape: BodyShape | null) => void,
) {
  return {
    className: `body-shape${enabled ? '' : ' is-off'}${selected ? ' is-selected' : ''}`,
    role: 'button',
    tabIndex: 0,
    'aria-label': enabled ? shape.label : `${shape.label} – coming soon`,
    'aria-pressed': enabled ? selected : undefined,
    'aria-disabled': enabled ? undefined : true,
    onClick: () => onSelect(shape),
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onSelect(shape)
      }
    },
    onFocus: () => onHover(shape),
    onBlur: () => onHover(null),
    onMouseEnter: () => onHover(shape),
    onMouseLeave: () => onHover(null),
  }
}

function ShapeItem({
  shape,
  enabled,
  selected,
  onSelect,
  onHover,
}: {
  shape: BodyShape
  enabled: boolean
  selected: boolean
  onSelect: (shape: BodyShape) => void
  onHover: (shape: BodyShape | null) => void
}) {
  const geometry = shape.geometry
  const common = shapeProps(shape, enabled, selected, onSelect, onHover)

  switch (geometry.kind) {
    case 'circle':
      return (
        <g>
          {selected && (
            <circle
              className="map-halo"
              cx={geometry.cx}
              cy={geometry.cy}
              r={geometry.r + 10}
              aria-hidden="true"
            />
          )}
          <circle {...common} cx={geometry.cx} cy={geometry.cy} r={geometry.r} />
        </g>
      )
    case 'ellipse':
      return (
        <ellipse
          {...common}
          cx={geometry.cx}
          cy={geometry.cy}
          rx={geometry.rx}
          ry={geometry.ry}
        />
      )
    case 'rect':
      return (
        <rect
          {...common}
          x={geometry.x}
          y={geometry.y}
          width={geometry.width}
          height={geometry.height}
          rx={geometry.rx}
        />
      )
  }
}

const views: BodyView[] = ['front', 'back']

export function BodyMap({
  onSelect,
}: {
  onSelect: (regionId: string, side: BodySide) => void
}) {
  const [view, setView] = useState<BodyView>('front')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const shapes = shapesForView(view)
  const selected = shapes.find((shape) => shape.id === selectedId) ?? null
  const hovered = shapes.find((shape) => shape.id === hoveredId) ?? null

  function switchView(next: BodyView) {
    setView(next)
    setSelectedId(null)
    setHoveredId(null)
  }

  function press(shape: BodyShape) {
    if (isRegisteredRegion(shape.regionId)) {
      setSelectedId((current) => (current === shape.id ? null : shape.id))
    } else {
      setHoveredId(shape.id)
    }
  }

  const hint =
    hovered !== null && !isRegisteredRegion(hovered.regionId)
      ? `${hovered.label} – coming soon`
      : null

  const side: BodySide | null =
    selected !== null && selected.side !== 'center' ? selected.side : null

  return (
    <div className="map">
      <div className="map-toggle" role="group" aria-label="Body map view">
        {views.map((target) => (
          <button
            key={target}
            type="button"
            className={view === target ? 'on' : undefined}
            aria-pressed={view === target}
            onClick={() => switchView(target)}
          >
            {target === 'front' ? 'Front' : 'Back'}
          </button>
        ))}
      </div>

      <svg
        className="body-map"
        viewBox="0 0 200 400"
        role="group"
        aria-label="Body map"
      >
        <g aria-hidden="true">
          {baseParts.map((geometry, index) => (
            <BasePart key={index} geometry={geometry} />
          ))}
        </g>
        {shapes.map((shape) => (
          <ShapeItem
            key={shape.id}
            shape={shape}
            enabled={isRegisteredRegion(shape.regionId)}
            selected={shape.id === selectedId}
            onSelect={press}
            onHover={(target) => setHoveredId(target?.id ?? null)}
          />
        ))}
      </svg>

      <p className="map-hint" aria-live="polite">
        {hint ?? 'Tap a region on the body.'}
      </p>

      {selected !== null && (
        <div className="map-sheet">
          <div className="map-sheet-handle" aria-hidden="true" />
          <div className="map-sheet-row">
            <strong className="map-sheet-title">{selected.label}</strong>
            <Chip variant="accent">Selected</Chip>
          </div>
          {side !== null && (
            <PrimaryButton onClick={() => onSelect(selected.regionId, side)}>
              Continue
            </PrimaryButton>
          )}
        </div>
      )}
    </div>
  )
}
