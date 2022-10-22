import { useCallback, useContext, useMemo } from 'react'

import { useAppState } from '../appState'
import { Service, dataContext } from '../data/DataContext'
import { splitServicesToGroups } from '../utils/splitServicesToGroups'
import { ServiceListControlPanel } from './ServiceListControlPanel'
import { sortFunctions } from './SortCriteria'

export interface ServiceGroup {
  name: string
  services: Service[]
}

export function useServiceControls() {
  const { services } = useContext(dataContext)

  const [sortBy] = useAppState('serviceView.sortCriteria')
  const [groupsEnabled] = useAppState('serviceView.groupsEnabled')

  const groupedServices = useMemo<ServiceGroup[]>(() => splitServicesToGroups(services), [services])
  const unsortedGroups = useMemo<ServiceGroup[]>(
    () => (groupsEnabled ? groupedServices : [{ name: 'All', services }]),
    [groupedServices, services, groupsEnabled]
  )
  const sortedGroups = useMemo<ServiceGroup[]>(
    () => unsortedGroups.map((group) => ({ ...group, services: [...group.services].sort(sortFunctions[sortBy]) })),
    [sortBy, unsortedGroups]
  )

  const ControlPanel = useCallback(() => <ServiceListControlPanel />, [])

  return {
    serviceGroups: sortedGroups,
    ControlPanel,
  }
}
