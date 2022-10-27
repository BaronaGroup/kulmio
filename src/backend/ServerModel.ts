import path from 'path'

import { LatestConfig, ServerConfig, ServiceConfig, validateConfig } from './config'
import { AnyConfig } from './config'
import Service from './Service'

export type ConfigFile = AnyConfig | { default: AnyConfig } | { kulmio: AnyConfig } | { kulmioConfig: AnyConfig }

export type RuntimeServerConfig = Omit<ServerConfig, 'baseDir'> & {
  baseDir: string
}

export type RuntimeConfig = LatestConfig & {
  runtime: RuntimeServerConfig
}

interface ConfigServicePair {
  serviceConfig: ServiceConfig
  systemConfig: RuntimeConfig
}

export default class ServerModel {
  public readonly services: Service[]
  public readonly config: RuntimeServerConfig

  constructor(configFile: string) {
    const config = loadConfigFile(process.cwd(), configFile)
    this.config = config[0].systemConfig.runtime
    this.services = config.map(({ serviceConfig, systemConfig }) => new Service(systemConfig.runtime, serviceConfig))
  }

  public getService(name: string) {
    const found = this.services.find((s) => s.name === name || s.aliases.includes(name))
    if (!found) throw new Error('No such service: ' + name)
    return found
  }

  public getServicesByName(name: string): Service[] {
    const serviceGroup = this.services.filter((s) => s.config.groups && s.config.groups.includes(name))
    if (serviceGroup.length) return serviceGroup
    return [this.getService(name)]
  }

  public isKnownName(name: string) {
    return this.services.some(
      (s) => s.name === name || s.aliases.includes(name) || (s.config.groups || []).includes(name)
    )
  }
}

function loadConfigFile(workingPath: string, filename: string): ConfigServicePair[] {
  process.env.KULMIO_MAX_CONFIG_VERSION = '3'
  const configPath = path.resolve(workingPath, filename)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rawConfig = require(configPath) as ConfigFile as any
  const config: AnyConfig = rawConfig.kulmioConfig || rawConfig.kulmio || rawConfig.default || rawConfig

  validateConfig(config)

  const baseDir = (config.config && config.config.baseDir) || path.dirname(configPath)
  const configObj = config.config || {}

  const output = config.services.map<ConfigServicePair>((serviceConfig) => ({
    serviceConfig,
    systemConfig: { ...config, runtime: { ...configObj, baseDir }, schema: 'V3' },
  }))
  for (const extended of config.extends || []) {
    for (const service of loadConfigFile(path.dirname(configPath), extended)) {
      if (output.some((oldService) => oldService.serviceConfig.name === service.serviceConfig.name)) continue
      output.push(service)
    }
  }
  return output
}
