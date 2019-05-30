// Generated file, do not edit!

// tslint:disable array-type
// @ts-ignore -- ignore possibly unused type parameters
export interface ConfigV1Base<IDType, DateType> {
  schema: 'V1' | 'https://raw.githubusercontent.com/BaronaGroup/kulmio/master/generated/json-schemas/config-v1.json'
  config?: {
    envDirectories?: Array<string>
    envFiles?: Array<string>
    baseDir?: string
    screenSuffix?: string
  }
  services: Array<{
    name: string
    envName?: string
    command: string
    stopCommand?: string
    build?: string
    workDir: string
    env: any
    envFiles?: Array<string>
    screenSuffix?: string
    excludeFromAll?: boolean
    groups?: Array<string>
  }>
  extends?: Array<string>
}
export const configV1Hash = 'f3ede5c68c9c4069ae5d0e5f277aeaa26ba2fc61166ea3d440476c7c37216b17'