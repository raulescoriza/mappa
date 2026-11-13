import { useState } from 'react'
import { isRegisteredRegion } from '../../domain/regions'
import { BodyMap } from '../components/BodyMap'
import { SelectionPanel, type PanelSelection, type PanelState } from '../components/SelectionPanel'
import { frontShapes } from '../bodyMap/shapes'
import type { BodySide, BodyView, RegionId } from '../bodyMap/shapes'

const CASE_STUDY_URL = 'https://raulescoriza.github.io/rehab-case-study.html'

function labelFor(regionId: RegionId, side: BodySide): string {
  const shape = frontShapes.find((entry) => entry.regionId === regionId && entry.side === side)
  return shape?.label ?? regionId
}

export function MapScreen({
  onSelect,
}: {
  onSelect: (regionId: RegionId, side: BodySide) => void
}) {
  const [view, setView] = useState<BodyView>('front')
  const [selected, setSelected] = useState<PanelSelection | null>(null)
  const [listOpen, setListOpen] = useState(false)

  const state: PanelState = selected !== null ? 'selected' : listOpen ? 'list' : 'empty'

  function choose(regionId: RegionId, side: BodySide, label?: string) {
    if (!isRegisteredRegion(regionId)) return
    setSelected({ regionId, side, label: label ?? labelFor(regionId, side) })
    setListOpen(false)
  }

  function toggleView(next: BodyView) {
    if (next === view) return
    setView(next)
    setSelected(null)
    setListOpen(false)
  }

  return (
    <div className="map-shell">
      <header className="map-topbar">
        <span className="map-logo">Mappa</span>
        <div className="map-topbar-right">
          <a className="map-casestudy" href={CASE_STUDY_URL} target="_blank" rel="noreferrer">
            Case study ↗
          </a>
          <span className="map-demo-chip">Concept demo</span>
        </div>
      </header>

      <div className="map-main">
        <div className="map-column">
          <div className="map-intro">
            <h1 className="map-title">Where does it hurt?</h1>
            <p className="map-lede">Tap a region on the body</p>
            <button type="button" className="map-picklist" onClick={() => setListOpen(true)}>
              Pick from a list →
            </button>
          </div>

          <BodyMap
            view={view}
            selected={selected === null ? null : { regionId: selected.regionId, side: selected.side }}
            onToggleView={toggleView}
            onSelect={(regionId, side, label) => choose(regionId, side, label)}
          />
        </div>

        <SelectionPanel
          state={state}
          selected={selected}
          onPick={(regionId, side) => choose(regionId, side)}
          onContinue={() => {
            if (selected !== null) onSelect(selected.regionId, selected.side)
          }}
          onClear={() => setSelected(null)}
        />
      </div>

      <footer className="map-footer">
        Concept prototype · not for clinical use · no data is stored or sent
      </footer>
    </div>
  )
}
