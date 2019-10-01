// Generated file, do not edit!

// tslint:disable
/* eslint-disable */
// @ts-ignore -- ignore possibly unused type parameters
export interface ConfigV1Base<IDType, DateType>
{
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
    healthCommand?: string
    build?: string
    workDir: string
    env?: any
    envFiles?: Array<string>
    screenSuffix?: string
    excludeFromAll?: boolean
    groups?: Array<string>
  }>
  extends?: Array<string>
}
export const configV1Hash = '5cf24b4c7421b59f1f2a24138fe8323674bec9ae3d90f0fd5926de417dfd9107'