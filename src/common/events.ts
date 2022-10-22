import { ServiceStatus } from './types'

export interface LogEvent {
  service: string
  line: string
  timestamp?: number
  offset: number
  meta?: {
    skipped?: number
  }
}

export type ClientToServerEvents = {
  listServices(): void
  checkServiceStatus(data: { service: string }): void

  startServices(data: { services: string[] }): void
  restartServices(data: { services: string[] }): void
  stopServices(data: { services: string[]; force?: boolean }): void

  subscribeToLogs(data: { service: string; id: string; sendLines?: number }): void
  unsubscribeFromLogs(data: { id: string }): void
}

export type ServerToClientEvents = {
  updateServiceList(data: { services: Array<{ name: string; groups: string[] }> }): void
  updateServiceStatus(data: { service: string; status: ServiceStatus }): void

  newLogEvents(data: { logEvents: LogEvent[]; isInitialBatch: boolean }): void
}
