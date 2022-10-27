import fs from 'fs'

import { createJSONSchema, createTypescriptInterfaceDefinition } from 'schematar'

import v1Schema from './schemas/config-v1'
import v2Schema from './schemas/config-v2'
import v3Schema from './schemas/config-v3'

import mkdirp = require('mkdirp')

const schemas = [
  { name: 'config-v1', schema: v1Schema, interface: 'ConfigV1' },
  { name: 'config-v2', schema: v2Schema, interface: 'ConfigV2' },
  { name: 'config-v3', schema: v3Schema, interface: 'ConfigV3' },
]

const interfaceDir = __dirname + '/../../generated/schematar',
  jsonSchemaDir = __dirname + '/../../generated/json-schemas'

mkdirp.sync(interfaceDir)
mkdirp.sync(jsonSchemaDir)

for (const schemaInfo of schemas) {
  const interfaceData = createTypescriptInterfaceDefinition(schemaInfo.interface, schemaInfo.schema, undefined, {
    omitExtraExports: true,
    exportHash: schemaInfo.interface[0].toLowerCase() + schemaInfo.interface.substring(1) + 'Hash',
  })
  fs.writeFileSync(interfaceDir + '/' + schemaInfo.name + '.ts', interfaceData, 'utf8')

  const jsonSchema = createJSONSchema(schemaInfo.schema, undefined, { allowAdditionalFields: false })
  fs.writeFileSync(jsonSchemaDir + '/' + schemaInfo.name + '.json', JSON.stringify(jsonSchema, null, 2), 'utf8')
}
