import Service, {ServiceConfig} from './Service'
import path from 'path'
import {ServerConfig} from './ServerConfig'

interface ConfigFile {
  config: ServerConfig,
  services: [ServiceConfig]
  extends: string[]
}

interface ConfigServicePair {
  serviceConfig: ServiceConfig
  systemConfig: ConfigFile
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
  const config: ConfigFile = require(configPath)
  if (!config.config.baseDir) {
    config.config.baseDir = path.dirname(configPath)
  }
  const output = config.services.map(serviceConfig => ({serviceConfig, systemConfig: config}))
  for (const extended of config.extends || []) {
    for (const service of loadConfigFile(path.dirname(configPath), extended)) {
      if (output.some(oldService => oldService.serviceConfig.name === service.serviceConfig.name)) continue
      output.push(service)
    }
  }
  return output
}


