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
  }>
  extends?: Array<string>
}
export const configV1Hash = '1140eb15d4f5e8ca33e112b69ecb97027402073aa520e379c74df2825c7c9f1d'