import {ConfigV1Base, configV1Hash} from '../generated/schematar/config-v1'
import {hashSchema} from 'schematar'
import v1 from './schemas/config-v1'

if (configV1Hash !== hashSchema(v1)) throw new Error('V1 typescript interface is out of date')

export type ConfigV1 = ConfigV1Base<void, void>
export type Config = ConfigV1 // or any other config version, when added

export type ServerConfig = Config['config']
export type ServiceConfig = Config['services'][0]
