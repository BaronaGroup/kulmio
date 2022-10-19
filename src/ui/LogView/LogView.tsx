import React, { useState } from 'react'

import { LogControls } from './LogControls'
import { LogData } from './LogData'
import { LogFilter } from './LogFilter'

export const LogView: React.FC = () => {
  const [enabledServices, setEnabledServices] = useState<string[]>([])
  return (
    <div className="flex">
      <LogControls services={enabledServices} onSetServices={setEnabledServices} />
      <div className="grow flex flex-col">
        <LogFilter />
        <LogData services={enabledServices} />
      </div>
    </div>
  )
}
