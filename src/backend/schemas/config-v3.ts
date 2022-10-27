import { Complex, Schema } from 'schematar'

import { configFieldsV1, serviceFieldsV1 } from './config-v1'

export const configTokensV3 = [
  'V3',
  'https://raw.githubusercontent.com/BaronaGroup/kulmio/master/generated/json-schemas/config-v3.json',
]

export default {
  fields: {
    schema: {
      type: String,
      enum: configTokensV3,
    },
    config: {
      optional: true,
      type: new Complex({
        ...configFieldsV1,
        uiPort: { type: Number, optional: true },
      }),
    },
    services: {
      type: [
        new Complex({
          ...serviceFieldsV1,
          logParser: {
            optional: true,
            type: new Complex({
              unhealthy: { type: String, optional: true },
              possiblyHealthy: { type: String, optional: true },
              timestamp: { type: String, optional: true },
            }),
          },
        }),
      ],
    },
    extends: { type: [String], optional: true },
  },
} as Schema
