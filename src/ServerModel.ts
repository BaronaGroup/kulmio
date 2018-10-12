import Service, {ServiceConfig} from './Service'
import path from 'path'
import {ServerConfig} from './ServerConfig'

interface ConfigFile {
  config: ServerConfig,
  services: [ServiceConfig]
}

export default class ServerModel {
  public readonly services: Service[]

  constructor(configFile: string) {
    const configPath = path.resolve(process.cwd(), configFile)
    const config: ConfigFile = require(configPath)
    if (!config.config.baseDir) {
      config.config.baseDir = path.dirname(configPath)
    }
    this.services = config.services.map(serviceConfig => new Service(config.config, serviceConfig))
  }

}

