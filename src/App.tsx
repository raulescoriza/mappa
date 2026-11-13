import { useReducer } from 'react'

import { getRegion } from './domain/regions'
import { flowReducer, initialState } from './ui/flow'
import { CheckInScreen } from './ui/screens/CheckInScreen'
import { IrritabilityScreen } from './ui/screens/IrritabilityScreen'
import { MapScreen } from './ui/screens/MapScreen'
import { OutOfScopeScreen } from './ui/screens/OutOfScopeScreen'
import { PlanScreen } from './ui/screens/PlanScreen'
import { ReferralScreen } from './ui/screens/ReferralScreen'
import { RedFlagsScreen } from './ui/screens/RedFlagsScreen'
import { ScopeScreen } from './ui/screens/ScopeScreen'

function App() {
  const [state, dispatch] = useReducer(flowReducer, initialState)

  // The body map step manages its own full-bleed layout (top bar, map, and
  // footer) so the body can be sized by the available height without scrolling.
  if (state.step === 'map') {
    return (
      <MapScreen
        onSelect={(regionId, side) => dispatch({ type: 'SELECT_REGION', regionId, side })}
      />
    )
  }

  return (
    <main className="app">
      {state.step === 'redFlags' && (
        <RedFlagsScreen
          region={getRegion(state.regionId)}
          answers={state.answers}
          dispatch={dispatch}
        />
      )}
      {state.step === 'scope' && (
        <ScopeScreen
          region={getRegion(state.regionId)}
          answers={state.answers}
          dispatch={dispatch}
        />
      )}
      {state.step === 'referral' && (
        <ReferralScreen flag={state.flag} dispatch={dispatch} />
      )}
      {state.step === 'outOfScope' && (
        <OutOfScopeScreen reason={state.reason} dispatch={dispatch} />
      )}
      {state.step === 'irritability' && (
        <IrritabilityScreen
          region={getRegion(state.regionId)}
          answers={state.answers}
          dispatch={dispatch}
        />
      )}
      {state.step === 'plan' && (
        <PlanScreen
          region={getRegion(state.regionId)}
          current={state.current}
          lastDecision={state.lastDecision}
          dispatch={dispatch}
        />
      )}
      {state.step === 'checkIn' && (
        <CheckInScreen current={state.current} dispatch={dispatch} />
      )}
      <p className="app-footer">
        Concept prototype. Not intended to diagnose, and not a substitute for an
        assessment by a healthcare professional.
      </p>
    </main>
  )
}

export default App
