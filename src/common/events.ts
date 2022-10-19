import { ServiceStatus } from './types'

export type ClientToServerEvents = {
  listServices(): void
  checkServiceStatus(data: { service: string }): void
}

export type ServerToClientEvents = {
  updateServiceList(data: { services: Array<{ name: string; groups: string[] }> }): void
  updateServiceStatus(data: { service: string; status: ServiceStatus }): void
}
