import fs from 'fs'
import path from 'path'

import mkdirp from 'mkdirp'

import { ServiceStatus } from '../common/types'
import { RuntimeServerConfig } from './ServerModel'

export type LogEvent = { type: 'STATUS_UPDATED'; serviceName: string; status: ServiceStatus }
let logDirShouldExist = false
export function getEventLogFilename(config: RuntimeServerConfig) {
  if (!logDirShouldExist) {
    logDirShouldExist = true
    mkdirp.sync(path.join(config.baseDir, 'logs'))
  }
  return path.join(config.baseDir, 'logs', 'kulmio-events.log')
}

export function logEvent(config: RuntimeServerConfig, event: LogEvent) {
  return fs.promises.appendFile(getEventLogFilename(config), JSON.stringify(event) + '\n', 'utf-8')
}
