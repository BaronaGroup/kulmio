import { Service } from '../data/DataContext'

export const enum SortCriteria {
  NAME = 'NAME',
  STATUS = 'STATUS',
}

const statusPriorities: { [K in Service['status']]: number } = {
  RUNNING: 1,
  ERROR: 2,
  PENDING: 3,
  WAITING_DEPS: 4,
  STOPPED: 10,
}

export const sortFunctions = {
  [SortCriteria.NAME]: (a: Service, b: Service) => a.name.localeCompare(b.name),
  [SortCriteria.STATUS]: (a: Service, b: Service) =>
    statusPriorities[a.status] - statusPriorities[b.status] || sortFunctions.NAME(a, b),
}
