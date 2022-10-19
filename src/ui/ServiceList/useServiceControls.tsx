import { useCallback, useContext, useMemo, useReducer, useState } from 'react'

import { Service, dataContext } from '../data/DataContext'
import { splitServicesToGroups } from '../utils/splitServicesToGroups'
import { ServiceListControlPanel } from './ServiceListControlPanel'
import { SortCriteria, sortFunctions } from './SortCriteria'

export interface ServiceGroup {
  name: string
  services: Service[]
}

export function useServiceControls() {
  const { services } = useContext(dataContext)

  const [isGroupsEnabled, toggleGroups] = useReducer((v) => !v, true)
  const [isListVertical, toggleVerticalList] = useReducer((v) => !v, false)
  const [sortBy, setSortBy] = useState<SortCriteria>(SortCriteria.NAME)

  const groupedServices = useMemo<ServiceGroup[]>(() => splitServicesToGroups(services), [services])
  const unsortedGroups = useMemo<ServiceGroup[]>(
    () => (isGroupsEnabled ? groupedServices : [{ name: 'All', services }]),
    [groupedServices, services, isGroupsEnabled]
  )
  const sortedGroups = useMemo<ServiceGroup[]>(
    () => unsortedGroups.map((group) => ({ ...group, services: [...group.services].sort(sortFunctions[sortBy]) })),
    [sortBy, unsortedGroups]
  )

  const ControlPanel = useCallback(
    () => (
      <ServiceListControlPanel
        isGroupsEnabled={isGroupsEnabled}
        toggleGroups={toggleGroups}
        sortBy={sortBy}
        setSortBy={setSortBy}
        isListVertical={isListVertical}
        toggleVerticalList={toggleVerticalList}
      />
    ),
    [isGroupsEnabled, sortBy, isListVertical]
  )

  return {
    serviceGroups: sortedGroups,
    ControlPanel,
    isListVertical,
  }
}
