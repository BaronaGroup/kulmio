import React from 'react'

import { TopLevelView, useAppState } from './appState'
import { LogView } from './LogView/LogView'
import { ServiceList } from './ServiceList/ServiceList'

export const Views: React.FC = () => {
  const [view] = useAppState('global.activeView')
  return (
    <div>
      {view === TopLevelView.SERVICES && <ServiceList />}
      {view === TopLevelView.LOGS && <LogView />}
    </div>
  )
}
