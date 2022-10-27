import { Complex, Schema } from 'schematar'

import { configFieldsV1 } from './config-v1'

export const configTokensV2 = [
  'V2',
  'https://raw.githubusercontent.com/BaronaGroup/kulmio/master/generated/json-schemas/config-v2.json',
]

export default {
  fields: {
    schema: {
      type: String,
      enum: configTokensV2,
    },
    config: {
      optional: true,
      type: new Complex({
        ...configFieldsV1,
      }),
    },
    services: {
      type: [
        new Complex({
          /*...serviceFieldsV1,
          execPrefix: { type: String, optional: true },*/
        }),
      ],
    },
    extends: { type: [String], optional: true },
  },
} as Schema
