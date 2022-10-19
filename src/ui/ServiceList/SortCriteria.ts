import { Service } from '../data/DataContext'

export const enum SortCriteria {
  NAME = 'NAME',
  STATUS = 'STATUS',
}

const statusPriorities: { [K in Service['status']]: number } = {
  EXTERNAL: 1,
  RUNNING: 1,
  'RUNNING:HEALTHY': 1,
  UNHEALTHY: 2,
  PENDING: 3,
  WAITING_DEPS: 4,
  STOPPING: 10,
  STOPPED: 10,
  UNKNOWN: 12,
}

export const sortFunctions = {
  [SortCriteria.NAME]: (a: Service, b: Service) => a.name.localeCompare(b.name),
  [SortCriteria.STATUS]: (a: Service, b: Service) =>
    statusPriorities[a.status] - statusPriorities[b.status] || sortFunctions.NAME(a, b),
}
