import { ConfigV1Base, configV1Hash } from '../generated/schematar/config-v1'
import { hashSchema } from 'schematar'
import v1 from './schemas/config-v1'
import v1json from '../generated/json-schemas/config-v1.json'
import Ajv from 'ajv'

if (configV1Hash !== hashSchema(v1)) throw new Error('V1 typescript interface is out of date')

export type ConfigV1 = ConfigV1Base<void, void>
export type Config = ConfigV1 // or any other config version, when added

export type ServerConfig = Config['config']
export type ServiceConfig = Config['services'][0]

const ajv = new Ajv()
const validateV1 = ajv.compile(v1json)

export function validateConfig(config: Config): void {
  if (config.schema === undefined) {
    // Support legacy kulmio files without explicit schema
    return validateConfig({
      ...config,
      schema: 'V1',
    })
  }
  switch (config.schema) {
    case 'https://raw.githubusercontent.com/BaronaGroup/kulmio/master/generated/json-schemas/config-v1.json':
    case 'V1': {
      const isValid = validateV1(config)
      console.log('iv', isValid)
      if (!isValid) {
        throw new Error('Configuration validation failed: ' + JSON.stringify(validateV1.errors, null, 2))
      }
      break
    }
    default:
      throw new Error(
        'Kulmio config file specifies schema not supported by this version of kulmio. Either the config file is wrong, or you need a new version of kulmio.'
      )
  }
}
