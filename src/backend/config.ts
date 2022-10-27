import Ajv from 'ajv'
import { hashSchema } from 'schematar'

import v1json from '../../generated/json-schemas/config-v1.json'
import v2json from '../../generated/json-schemas/config-v2.json'
import v3json from '../../generated/json-schemas/config-v3.json'
import { ConfigV1Base, configV1Hash } from '../../generated/schematar/config-v1'
import { ConfigV2Base, configV2Hash } from '../../generated/schematar/config-v2'
import { ConfigV3Base, configV3Hash } from '../../generated/schematar/config-v3'
import v1, { configTokensV1 } from './schemas/config-v1'
import v2, { configTokensV2 } from './schemas/config-v2'
import v3, { configTokensV3 } from './schemas/config-v3'

if (configV1Hash !== hashSchema(v1)) throw new Error('V1 typescript interface is out of date')
if (configV2Hash !== hashSchema(v2)) throw new Error('V2 typescript interface is out of date')
if (configV3Hash !== hashSchema(v3)) throw new Error('V3 typescript interface is out of date')

export type ConfigV1 = ConfigV1Base<void, void>
export type ConfigV2 = ConfigV2Base<void, void>
export type ConfigV3 = ConfigV3Base<void, void>

export type LatestConfig = ConfigV3
export type AnyConfig = ConfigV1 | ConfigV3

const configs = [
  {
    tokens: configTokensV1,
    json: v1json,
  },
  {
    tokens: configTokensV2,
    json: v2json,
  },
  {
    tokens: configTokensV3,
    json: v3json,
  },
]

export type ServerConfig = NonNullable<LatestConfig['config']>
export type ServiceConfig = LatestConfig['services'][0]

export function validateConfig(config: AnyConfig): void {
  if (config.schema === undefined) {
    // Support legacy kulmio files without explicit schema
    return validateConfig({
      ...(config as any),
      schema: 'V1',
    })
  }

  const configSchema = configs.find((c) => c.tokens.includes(config.schema))
  if (!configSchema) {
    throw new Error(
      'Kulmio config file specifies schema not supported by this version of kulmio. Either the config file is wrong, or you need a new version of kulmio.'
    )
  }
  const ajv = new Ajv()
  const validateImpl = ajv.compile(configSchema.json)
  const isValid = validateImpl(config)
  if (!isValid) {
    throw new Error('Configuration validation failed: ' + JSON.stringify(validateImpl.errors, null, 2))
  }
  return
}
