import Service from './Service'
import path from 'path'
import { Config, ServiceConfig, validateConfig } from './config'
import { Existing } from './types'

export type ConfigFile = Config | { default: Config } | { kulmio: Config } | { kulmioConfig: Config }

export type RuntimeServerConfig = Omit<Existing<Config['config']>, 'baseDir'> & {
  baseDir: string
}

export type RuntimeConfig = Config & {
  runtime: RuntimeServerConfig
}

interface ConfigServicePair {
  serviceConfig: ServiceConfig
  systemConfig: RuntimeConfig
}

export default class ServerModel {
  public readonly services: Service[]

  constructor(configFile: string) {
    const config = loadConfigFile(process.cwd(), configFile)
    this.services = config.map(({ serviceConfig, systemConfig }) => new Service(systemConfig.runtime, serviceConfig))
  }

  public getService(name: string) {
    const found = this.services.find(s => s.name === name || s.aliases.includes(name))
    if (!found) throw new Error('No such service: ' + name)
    return found
  }

  public isKnownName(name: string) {
    return this.services.some(s => s.name === name || s.aliases.includes(name))
  }
}

function loadConfigFile(workingPath: string, filename: string): ConfigServicePair[] {
  const configPath = path.resolve(workingPath, filename)
  const rawConfig = (require(configPath) as ConfigFile) as any
  const config: Config = rawConfig.kulmioConfig || rawConfig.kulmio || rawConfig.default || rawConfig

  validateConfig(config)

  const baseDir = (config.config && config.config.baseDir) || path.dirname(configPath)
  const configObj = config.config || {}

  const output = config.services.map(serviceConfig => ({
    serviceConfig,
    systemConfig: { ...config, runtime: { ...configObj, baseDir } },
  }))
  for (const extended of config.extends || []) {
    for (const service of loadConfigFile(path.dirname(configPath), extended)) {
      if (output.some(oldService => oldService.serviceConfig.name === service.serviceConfig.name)) continue
      output.push(service)
    }
  }
  return output
}
