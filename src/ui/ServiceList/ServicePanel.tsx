import throttle from 'lodash/throttle'
import { useCallback, useEffect, useMemo } from 'react'

import { CommandSet } from '../components/CommandSet'
import { Service } from '../data/DataContext'
import { SelectionCheckbox } from '../selection/SelectionCheckbox'
import { useIsSelected } from '../selection/SelectionContext'
import { socket } from '../socketio'
import { getStatusBorderColorClass } from '../visuals/getStatusBorderColorClass'
import { getStatusBoxClasses } from '../visuals/getStatusTextColorClass'

export const ServicePanel: React.FC<{ service: Service; highlight?: boolean }> = ({ service, highlight }) => {
  const isSelected = useIsSelected(service.name)

  const checkStatus = useCallback(() => socket.emit('checkServiceStatus', { service: service.name }), [service.name])
  const throttledCheckStatus = useMemo(
    () => throttle(checkStatus, 1000, { leading: true, trailing: false }),
    [checkStatus]
  )

  useEffect(() => {
    if (service.status === 'UNKNOWN') {
      checkStatus()
    }
  }, [checkStatus, service.name, service.status])

  const serviceNameInArray = useMemo(() => [service.name], [service.name])
  return (
    <div
      onMouseEnter={throttledCheckStatus}
      className={`w-64 ${isSelected ? 'border-2 bg-slate-100' : 'border-2'} 
      ${highlight ? 'bg-sky-100' : ''}
        rounded-md h-12 m-2 group ${getStatusBorderColorClass(service.status)} flex pl-2 items-center`}
    >
      <SelectionCheckbox item={service.name} />
      <span className="mx-2 grow text-left">{service.name}</span>
      <div className={'flex flex-col self-stretch'}>
        <div className="group-hover:opacity-100 opacity-20 transition-opacity grow">
          <CommandSet services={serviceNameInArray} />
        </div>
        <div className={`${getStatusBoxClasses(service.status)}`}>{service.status.toLowerCase()}</div>
      </div>
    </div>
  )
}
