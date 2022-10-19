import { Service } from '../data/DataContext'
import { ServiceGroup } from '../ServiceList/useServiceControls'

export function splitServicesToGroups(services: Service[]): ServiceGroup[] {
  const groupNameSet = new Set<string>()
  let anyUngrouped = false
  for (const service of services) {
    for (const group of service.groups) {
      groupNameSet.add(group)
    }
    if (!service.groups.length) {
      anyUngrouped = true
    }
  }
  const groupNames = [...groupNameSet].sort()

  const normalGroups = groupNames.map((name) => ({
    name,
    services: services.filter((s) => s.groups.includes(name)),
  }))

  return [
    ...normalGroups,
    ...(anyUngrouped ? [{ name: 'Ungrouped', services: services.filter((s) => s.groups.length === 0) }] : []),
  ]
}
