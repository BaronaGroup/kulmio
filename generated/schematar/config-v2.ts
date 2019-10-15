// Generated file, do not edit!

// tslint:disable
/* eslint-disable */
// @ts-ignore -- ignore possibly unused type parameters
export interface ConfigV2Base<IDType, DateType>
{
  schema: 'V2' | 'https://raw.githubusercontent.com/BaronaGroup/kulmio/master/generated/json-schemas/config-v2.json'
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
export const configV2Hash = '51b4457b094f0548778e61e855cd9bf60999d3de44a130b6b2b5079733a605f2'