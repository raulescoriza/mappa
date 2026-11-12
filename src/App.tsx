import { useReducer } from 'react'

import { getRegion } from './domain/regions'
import { PrimaryButton } from './ui/components/PrimaryButton'
import { Screen } from './ui/components/Screen'
import { flowReducer, initialState } from './ui/flow'
import type { FlowEvent } from './ui/flow'
import { CheckInScreen } from './ui/screens/CheckInScreen'
import { IrritabilityScreen } from './ui/screens/IrritabilityScreen'
import { OutOfScopeScreen } from './ui/screens/OutOfScopeScreen'
import { PlanScreen } from './ui/screens/PlanScreen'
import { ReferralScreen } from './ui/screens/ReferralScreen'
import { RedFlagsScreen } from './ui/screens/RedFlagsScreen'
import { ScopeScreen } from './ui/screens/ScopeScreen'

type Dispatch = (event: FlowEvent) => void

function MapScreen({ dispatch }: { dispatch: Dispatch }) {
  return (
    <Screen title="Where does it hurt?">
      <p className="map-hint">Pick the region you would like to work on.</p>
      <PrimaryButton
        onClick={() =>
          dispatch({ type: 'SELECT_REGION', regionId: 'shoulder' })
        }
      >
        Select shoulder
      </PrimaryButton>
      <button type="button" className="btn-neutral" disabled>
        Neck (coming soon)
      </button>
      <button type="button" className="btn-neutral" disabled>
        Lower back (coming soon)
      </button>
    </Screen>
  )
}

function App() {
  const [state, dispatch] = useReducer(flowReducer, initialState)

  return (
    <main className="app">
      {state.step === 'map' && <MapScreen dispatch={dispatch} />}
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
