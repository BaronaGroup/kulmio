import { ServiceStatus } from './types'

export type ClientToServerEvents = {
  listServices(): void
  checkServiceStatus(data: { service: string }): void

  startServices(data: { services: string[] }): void
  restartServices(data: { services: string[] }): void
  stopServices(data: { services: string[]; force?: boolean }): void
}

export type ServerToClientEvents = {
  updateServiceList(data: { services: Array<{ name: string; groups: string[] }> }): void
  updateServiceStatus(data: { service: string; status: ServiceStatus }): void
}
