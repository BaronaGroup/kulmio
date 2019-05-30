import v1Schema from './schemas/config-v1'
import {createTypescriptInterfaceDefinition, createJSONSchema} from 'schematar'
import mkdirp = require('mkdirp')
import fs from 'fs'

const schemas = [{name: 'config-v1', schema: v1Schema}]

const interfaceDir = __dirname + '/../generated/schematar',
  jsonSchemaDir = __dirname + '/../generated/json-schemas'

mkdirp.sync(interfaceDir)
mkdirp.sync(jsonSchemaDir)

for (const schemaInfo of schemas) {
  const interfaceData = createTypescriptInterfaceDefinition('ConfigV1', schemaInfo.schema, undefined, {
    omitExtraExports: true,
    exportHash: 'configV1Hash',
  })
  fs.writeFileSync(interfaceDir + '/' + schemaInfo.name + '.ts', interfaceData, 'utf8')

  const jsonSchema = createJSONSchema(schemaInfo.schema, undefined, {allowAdditionalFields: false})
  fs.writeFileSync(jsonSchemaDir + '/' + schemaInfo.name + '.json', JSON.stringify(jsonSchema, null, 2), 'utf8')
}
