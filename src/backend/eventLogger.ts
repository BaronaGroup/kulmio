import fs from 'fs'
import path from 'path'

import { ServiceStatus } from '../common/types'
import { RuntimeServerConfig } from './ServerModel'

export type LogEvent = { type: 'STATUS_UPDATED'; serviceName: string; status: ServiceStatus }

export function getEventLogFilename(config: RuntimeServerConfig) {
  return path.join(config.baseDir, 'logs', 'kulmio-events.log')
}

export function logEvent(config: RuntimeServerConfig, event: LogEvent) {
  return fs.promises.appendFile(getEventLogFilename(config), JSON.stringify(event) + '\n', 'utf-8')
}
