import Service, {ServiceConfig} from './Service'
import path from 'path'
import {ServerConfig} from './ServerConfig'

export type ConfigFile = Config | {default: Config} | {kulmio: Config} | {kulmioConfig: Config}

export interface Config {
  config?: ServerConfig
  services: ServiceConfig[]
  extends?: string[]
}
export interface ActiveConfig {
  config: ServerConfig
  services: ServiceConfig[]
  extends?: string[]
}

interface ConfigServicePair {
  serviceConfig: ServiceConfig
  systemConfig: ActiveConfig
}

export default class ServerModel {
  public readonly services: Service[]

  constructor(configFile: string) {
    const config = loadConfigFile(process.cwd(), configFile)
    this.services = config.map(({serviceConfig, systemConfig}) => new Service(systemConfig.config, serviceConfig))
  }
}

function loadConfigFile(workingPath: string, filename: string): ConfigServicePair[] {
  const configPath = path.resolve(workingPath, filename)
  const rawConfig = (require(configPath) as ConfigFile) as any
  const config: Config = rawConfig.kulmioConfig || rawConfig.kulmio || rawConfig.default || rawConfig

  if (!config.config) {
    config.config = {baseDir: path.dirname(configPath)}
  } else if (!config.config.baseDir) {
    config.config.baseDir = path.dirname(configPath)
  }
  const output = config.services.map(serviceConfig => ({serviceConfig, systemConfig: config as ActiveConfig}))
  for (const extended of config.extends || []) {
    for (const service of loadConfigFile(path.dirname(configPath), extended)) {
      if (output.some(oldService => oldService.serviceConfig.name === service.serviceConfig.name)) continue
      output.push(service)
    }
  }
  return output
}
