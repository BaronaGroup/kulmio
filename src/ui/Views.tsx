import React from 'react'

import { TopLevelView, useAppState } from './appState'
import { Select, SelectOption } from './components/Select'
import { LogView } from './LogView/LogView'
import { ServiceList } from './ServiceList/ServiceList'

const viewOptions: Array<SelectOption<TopLevelView>> = [
  { label: 'Services', value: TopLevelView.SERVICES },
  { label: 'Logs', value: TopLevelView.LOGS },
]

export const Views: React.FC = () => {
  const [view, setView] = useAppState('global.activeView')
  return (
    <div>
      <Select options={viewOptions} value={view} onChange={setView} />
      <div>
        {view === TopLevelView.SERVICES && <ServiceList />}
        {view === TopLevelView.LOGS && <LogView />}
      </div>
    </div>
  )
}
