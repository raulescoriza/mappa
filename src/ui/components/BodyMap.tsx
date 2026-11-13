import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { isRegisteredRegion } from '../../domain/regions'
import { BODY_VIEWBOX, shapesForView, silhouette } from '../bodyMap/shapes'
import type {
  BodySide,
  BodyView,
  DotShape,
  PathShape,
  RegionId,
  RegionShape,
} from '../bodyMap/shapes'

const views: BodyView[] = ['front', 'back']

function labelPlacement(shape: RegionShape): { x: number; y: number; anchor: 'start' | 'middle' | 'end' } {
  const { cx, cy } = shape.center
  if (shape.side === 'center') return { x: cx, y: cy - shape.hitR - 8, anchor: 'middle' }
  if (shape.side === 'right') return { x: cx - shape.hitR - 8, y: cy, anchor: 'end' }
  return { x: cx + shape.hitR + 8, y: cy, anchor: 'start' }
}

interface RegionProps {
  shape: RegionShape
  enabled: boolean
  selected: boolean
  onSelect: (shape: RegionShape) => void
  onHover: (shape: RegionShape | null) => void
}

// A single interactive (or coming-soon) region: a transparent hit target that
// is at least 44 px at the rendered size, the visible shape, and a hover /
// focus label anchored to the body.
function RegionGlyph({ shape, enabled, selected, onSelect, onHover }: RegionProps) {
  const { x, y, anchor } = labelPlacement(shape)
  const soon = !enabled
  const label = soon ? `${shape.name} – coming soon` : shape.label

  const hitProps = {
    className: 'region-hit',
    cx: shape.center.cx,
    cy: shape.center.cy,
    r: shape.hitR,
    role: 'button' as const,
    tabIndex: 0,
    'aria-label': label,
    'aria-pressed': enabled ? selected : undefined,
    'aria-disabled': soon ? true : undefined,
    onClick: () => onSelect(shape),
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onSelect(shape)
      }
    },
    onMouseEnter: () => onHover(shape),
    onMouseLeave: () => onHover(null),
    onFocus: () => onHover(shape),
    onBlur: () => onHover(null),
  }

  return (
    <g
      className={`map-region map-region--${shape.kind}${soon ? ' is-soon' : ''}${
        selected ? ' is-selected' : ''
      }`}
    >
      {selected && <circle className="region-glow" cx={shape.center.cx} cy={shape.center.cy} r={shape.hitR + 8} />}
      <circle {...hitProps} />
      {shape.kind === 'path' ? (
        <path
          className="region-shape"
          d={(shape as PathShape).path}
          clipPath="url(#mappa-body-clip)"
        />
      ) : (
        <circle
          className="region-dot"
          cx={(shape as DotShape).center.cx}
          cy={(shape as DotShape).center.cy}
          r={(shape as DotShape).r}
        />
      )}
      <text className="region-label" x={x} y={y} textAnchor={anchor}>
        {label}
      </text>
    </g>
  )
}

export function BodyMap({
  view,
  selected,
  onToggleView,
  onSelect,
}: {
  view: BodyView
  selected: { regionId: RegionId; side: BodySide } | null
  onToggleView: (view: BodyView) => void
  onSelect: (regionId: RegionId, side: BodySide, label: string) => void
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const shapes = shapesForView(view)
  const hovered = shapes.find((shape) => shape.id === hoveredId) ?? null
  const hinted =
    hovered !== null && !isRegisteredRegion(hovered.regionId)
      ? `${hovered.name} – coming soon`
      : hovered !== null
        ? hovered.label
        : null

  const hint =
    hinted ?? (selected !== null ? 'Selected.' : 'Tap a region on the body.')

  function press(shape: RegionShape) {
    if (isRegisteredRegion(shape.regionId) && shape.side !== 'center') {
      onSelect(shape.regionId, shape.side, shape.label)
    }
  }

  return (
    <div className="map">
      <div className="map-toggle" role="group" aria-label="Body view">
        {views.map((target) => (
          <button
            key={target}
            type="button"
            className={view === target ? 'on' : undefined}
            aria-pressed={view === target}
            onClick={() => onToggleView(target)}
          >
            {target === 'front' ? 'Front' : 'Back'}
          </button>
        ))}
      </div>

      <div className="map-stage">
        <div className="map-svg-wrap">
          <svg className="body-map" viewBox={BODY_VIEWBOX} role="group" aria-label="Body map">
            <defs>
              <clipPath id="mappa-body-clip">
                <path d={silhouette.body} />
              </clipPath>
            </defs>

            <g className="map-silhouette">
              <path d={silhouette.body} />
              <ellipse
                cx={silhouette.head.cx}
                cy={silhouette.head.cy}
                rx={silhouette.head.rx}
                ry={silhouette.head.ry}
              />
            </g>

            {shapes.map((shape) => (
              <RegionGlyph
                key={shape.id}
                shape={shape}
                enabled={isRegisteredRegion(shape.regionId)}
                selected={
                  selected !== null &&
                  selected.regionId === shape.regionId &&
                  selected.side === shape.side
                }
                onSelect={press}
                onHover={(target) => setHoveredId(target?.id ?? null)}
              />
            ))}

            {silhouette.markers.map((marker) => (
              <text key={marker.text} className="map-marker" x={marker.x} y={marker.y}>
                {marker.text}
              </text>
            ))}

            {view === 'back' && (
              <text className="map-back-note" x="100" y="240" textAnchor="middle">
                Back view coming soon
              </text>
            )}
          </svg>
        </div>

        <p className="map-hint" aria-live="polite">
          {hint}
        </p>
      </div>
    </div>
  )
}
