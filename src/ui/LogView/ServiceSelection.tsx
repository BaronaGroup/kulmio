import React, { useCallback, useContext, useMemo } from 'react'

import { useAppState } from '../appState'
import { dataContext } from '../data/DataContext'
import { sortFunctions } from '../ServiceList/SortCriteria'
import { splitServicesToGroups } from '../utils/splitServicesToGroups'
import { getServiceColorClass } from '../visuals/getServiceColorClass'

export const ServiceSelection: React.FC = () => {
  const [checked, setChecked] = useAppState('logView.activeServices')
  const { services } = useContext(dataContext)
  const groups = useMemo(() => {
    return splitServicesToGroups(services).map((s) => ({ ...s, services: s.services.sort(sortFunctions.NAME) }))
  }, [services])
  const isServiceChecked = useCallback((name: string) => checked.includes(name), [checked])

  const isGroupChecked = useCallback(
    (name: string) => groups.find((g) => g.name === name)?.services.every((s) => isServiceChecked(s.name)),
    [groups, isServiceChecked]
  )

  const toggleService = useCallback(
    (name: string) => {
      if (isServiceChecked(name)) {
        setChecked(checked.filter((n) => n !== name))
      } else {
        setChecked([...checked, name])
      }
    },
    [checked, isServiceChecked, setChecked]
  )
  const toggleGroup = useCallback(
    (name: string) => {
      const group = groups.find((g) => g.name === name)
      if (!group) return
      if (isGroupChecked(name)) {
        for (const service of group.services) {
          toggleService(service.name)
        }
      } else {
        for (const service of group.services) {
          if (!isServiceChecked(service.name)) {
            toggleService(service.name)
          }
        }
      }
    },
    [groups, isGroupChecked, isServiceChecked, toggleService]
  )

  const allChecked = useMemo(() => groups.every((group) => isGroupChecked(group.name)), [groups, isGroupChecked])
  const toggleAll = useCallback(() => {
    if (allChecked) {
      setChecked([])
    } else {
      setChecked(services.map((s) => s.name))
    }
  }, [allChecked, services, setChecked])

  return (
    <div>
      <div>
        <label>
          <input type="checkbox" checked={allChecked} onChange={toggleAll} /> All
        </label>
      </div>
      {groups.map((group) => (
        <div key={group.name}>
          <div>
            <label>
              <input type="checkbox" checked={isGroupChecked(group.name)} onChange={() => toggleGroup(group.name)} />{' '}
              {group.name}
            </label>
          </div>
          <div className="ml-4">
            {group.services.map((service) => (
              <div key={service.name}>
                <label className={getServiceColorClass(service.name)}>
                  <input
                    type="checkbox"
                    checked={isServiceChecked(service.name)}
                    onChange={() => toggleService(service.name)}
                  />{' '}
                  {service.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
