import { Complex, Schema } from 'schematar'

export const configFieldsV1 = {
  envDirectories: { type: [String], optional: true },
  envFiles: { type: [String], optional: true },
  baseDir: { type: String, optional: true },
  screenSuffix: { type: String, optional: true },
}
export const serviceFieldsV1 = {
  name: String,
  aliases: { type: [String], optional: true },
  dependencies: { type: [String], optional: true },
  softDependencies: { type: [String], optional: true },
  envName: { type: String, optional: true },
  useHealthForIsRunning: { type: Boolean, optional: true },
  command: String,
  stopCommand: { type: String, optional: true },
  healthCommand: { type: String, optional: true },
  build: { type: String, optional: true },
  workDir: String,
  env: { type: Object, optional: true },
  envFiles: { type: [String], optional: true },
  screenSuffix: { type: String, optional: true },
  excludeFromAll: { type: Boolean, optional: true },
  groups: { type: [String], optional: true },
  execPrefix: { type: String, optional: true },
}
export const configTokensV1 = [
  'V1',
  'https://raw.githubusercontent.com/BaronaGroup/kulmio/master/generated/json-schemas/config-v1.json',
]

export default {
  fields: {
    schema: {
      type: String,
      enum: configTokensV1,
    },
    config: {
      optional: true,
      type: new Complex(configFieldsV1),
    },
    services: {
      type: [new Complex(serviceFieldsV1)],
    },
    extends: { type: [String], optional: true },
  },
} as Schema
