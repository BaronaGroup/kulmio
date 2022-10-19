import React, { useState } from 'react'

import { Select, SelectOption } from './components/Select'
import { LogView } from './LogView/LogView'
import { ServiceList } from './ServiceList/ServiceList'

const enum View {
  SERVICES = 'SERVICES',
  LOGS = 'LOGS',
}

const viewOptions: Array<SelectOption<View>> = [
  { label: 'Services', value: View.SERVICES },
  { label: 'Logs', value: View.LOGS },
]

export const Views: React.FC = () => {
  const [view, setView] = useState<View>(View.SERVICES)
  return (
    <div>
      <Select options={viewOptions} value={view} onChange={setView} />
      <div>
        {view === View.SERVICES && <ServiceList />}
        {view === View.LOGS && <LogView />}
      </div>
    </div>
  )
}
