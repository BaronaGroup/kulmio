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
    aliases?: Array<string>
    dependencies?: Array<string>
    envName?: string
    useHealthForIsRunning?: boolean
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
    execPrefix?: string
  }>
  extends?: Array<string>
}
export const configV1Hash = '9f1feca91b87d1ceb86b1579beccbd06c1ca9d7b6d538842198f34b74705071d'