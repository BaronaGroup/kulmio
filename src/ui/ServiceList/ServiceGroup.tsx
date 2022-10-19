import React, { useReducer } from 'react'

import { CommandSet } from '../components/CommandSet'
import { ServicePanel } from './ServicePanel'
import type { ServiceGroup as ServiceGroupType } from './useServiceControls'

export const ServiceGroup: React.FC<{ group: ServiceGroupType; vertical?: boolean }> = ({ group, vertical }) => {
  const [highlight, toggleHighlight] = useReducer((v) => !v, false)

  return (
    <div key={group.name}>
      <h2 className="text-left text-lg mt-3">
        <div
          className="float-right opacity-20 hover:opacity-100 transition-opacity"
          onMouseEnter={toggleHighlight}
          onMouseLeave={toggleHighlight}
        >
          <CommandSet />
        </div>
        {group.name}
      </h2>
      <hr className="mb-4" />
      <div className={`flex flex-wrap mb-3 ${vertical ? 'flex-col' : ''}`}>
        {group.services.map((s) => (
          <ServicePanel key={s.name} service={s} highlight={highlight} />
        ))}
      </div>
    </div>
  )
}
