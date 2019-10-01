import { Schema, Complex } from 'schematar'

export default {
  fields: {
    schema: {
      type: String,
      enum: ['V1', 'https://raw.githubusercontent.com/BaronaGroup/kulmio/master/generated/json-schemas/config-v1.json'],
    },
    config: {
      optional: true,
      type: new Complex({
        envDirectories: { type: [String], optional: true },
        envFiles: { type: [String], optional: true },
        baseDir: { type: String, optional: true },
        screenSuffix: { type: String, optional: true },
      }),
    },
    services: {
      type: [
        new Complex({
          name: String,
          envName: { type: String, optional: true },
          command: String,
          stopCommand: { type: String, optional: true },
          build: { type: String, optional: true },
          workDir: String,
          env: { type: Object, optional: true },
          envFiles: { type: [String], optional: true },
          screenSuffix: { type: String, optional: true },
          excludeFromAll: { type: Boolean, optional: true },
          groups: { type: [String], optional: true },
        }),
      ],
    },
    extends: { type: [String], optional: true },
  },
} as Schema
