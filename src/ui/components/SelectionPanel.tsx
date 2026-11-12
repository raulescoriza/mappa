import type { BodySide, RegionId } from '../bodyMap/shapes'
import { Chip } from './Chip'
import { PrimaryButton } from './PrimaryButton'
import { RegionList } from './RegionList'

export type PanelState = 'empty' | 'list' | 'selected'

export interface PanelSelection {
  regionId: RegionId
  side: BodySide
  label: string
}

// One component that CSS places as a bottom sheet (< 768 px) or a side panel
// (>= 768 px). It shows the region list, the "how it works" overview, or the
// selected region. No JavaScript reads the viewport: the placement is pure
// CSS.
export function SelectionPanel({
  state,
  selected,
  onPick,
  onContinue,
  onClear,
}: {
  state: PanelState
  selected: PanelSelection | null
  onPick: (regionId: RegionId, side: BodySide) => void
  onContinue: () => void
  onClear: () => void
}) {
  return (
    <section className="panel" data-state={state}>
      <div className="panel-top">
        <div className="panel-block panel-intro">
          <h2 className="panel-title">Where does it hurt?</h2>
          <p className="panel-lede">Tap a region on the body, or pick it from the list.</p>
        </div>

        <div className="panel-block panel-selected">
          {selected !== null && (
            <>
              <div className="panel-title-row">
                <h2 className="panel-title">{selected.label}</h2>
                <Chip variant="accent">Selected</Chip>
              </div>
              <p className="panel-next">
                Next: a 5-question safety screen, then 3 questions on how irritable it is. About
                1 minute.
              </p>
              <div className="panel-actions">
                <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
                <button type="button" className="btn-ghost" onClick={onClear}>
                  Choose another region
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="panel-block panel-regionlist">
        <RegionList
          selected={selected === null ? null : { regionId: selected.regionId, side: selected.side }}
          onSelect={onPick}
        />
      </div>

      <div className="panel-block panel-how">
        <h3 className="panel-how-title">How it works</h3>
        <ol className="panel-how-list">
          <li>
            <span>1</span>
            <span>A short safety screen</span>
          </li>
          <li>
            <span>2</span>
            <span>How irritable is it?</span>
          </li>
          <li>
            <span>3</span>
            <span>A graded plan with weekly check-ins</span>
          </li>
        </ol>
      </div>
    </section>
  )
}
