import React from 'react'

import { TopLevelView, useAppState } from './appState'
import { Select, SelectOption } from './components/Select'

const viewOptions: Array<SelectOption<TopLevelView>> = [
  { label: 'Services', value: TopLevelView.SERVICES },
  { label: 'Logs', value: TopLevelView.LOGS },
]
export function ViewSelect() {
  const [view, setView] = useAppState('global.activeView')
  return <Select options={viewOptions} value={view} onChange={setView} />
}
