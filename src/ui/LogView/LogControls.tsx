import { useCallback } from 'react'

import { useAppState } from '../appState'
import { ViewSelect } from '../ViewSelect'
import { ServiceSelection } from './ServiceSelection'

export const LogControls: React.FC = () => {
  const [isTailing, setTailing] = useAppState('logView.isTailing')
  const [pausedAt, setPausedAt] = useAppState('logView.pausedAt')
  const [numberOfLines, setNumberOfLines] = useAppState('logView.numberOfLines')

  const toggleTailing = useCallback(() => {
    setTailing(!isTailing)
  }, [isTailing, setTailing])

  return (
    <div className="bg-slate-200 w-[200px] text-left p-2 select-none flex flex-col max-height-[100vh]">
      <div>
        <ViewSelect />
      </div>
      <div>
        Max lines
        <input type={'number'} value={numberOfLines} onChange={(e) => setNumberOfLines(e.target.valueAsNumber)} />
      </div>
      Mode
      <div>
        <label>
          <input type="radio" name="mode" checked={isTailing} onChange={toggleTailing} /> Live
        </label>
      </div>
      <div>
        <label>
          <input type="radio" name="mode" checked={!isTailing} onChange={toggleTailing} /> Paused
        </label>
      </div>
      {!isTailing && (
        <div>
          Paused at <input type={'text'} value={pausedAt ?? ''} onChange={(e) => setPausedAt(e.target.value)} />
        </div>
      )}
      <hr />
      Services
      <div className={'flex-shrink overflow-y-auto'}>
        <ServiceSelection />
      </div>
    </div>
  )
}
