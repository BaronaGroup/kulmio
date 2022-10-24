import React, { useState } from 'react'

import { LogControls } from './LogControls'
import { LogData } from './LogData'
import { LogDataProvider } from './LogDataProvider'
import { LogFilter } from './LogFilter'

export const LogView: React.FC = () => {
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null)

  return (
    <div className="flex fixed left-0 right-0 bottom-0 top-0">
      <LogControls />
      <div className="grow flex flex-col overflow-y-auto">
        <LogFilter />
        <div className={'overflow-y-auto'} ref={setScrollElement}>
          <LogDataProvider>
            <LogData scrollElement={scrollElement} />
          </LogDataProvider>
        </div>
      </div>
    </div>
  )
}
