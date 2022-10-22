import React from 'react'

import { LogControls } from './LogControls'
import { LogData } from './LogData'
import { LogFilter } from './LogFilter'

export const LogView: React.FC = () => {
  return (
    <div className="flex fixed left-0 right-0 bottom-0 top-0">
      <LogControls />
      <div className="grow flex flex-col">
        <LogFilter />
        <LogData />
      </div>
    </div>
  )
}
