// Generated file, do not edit!

// tslint:disable
/* eslint-disable */
// @ts-ignore -- ignore possibly unused type parameters
export interface ConfigV3Base<IDType, DateType>
{
  schema: 'V3' | 'https://raw.githubusercontent.com/BaronaGroup/kulmio/master/generated/json-schemas/config-v3.json'
  config?: {
    envDirectories?: Array<string>
    envFiles?: Array<string>
    baseDir?: string
    screenSuffix?: string
    uiPort?: number
  }
  services: Array<{
    name: string
    aliases?: Array<string>
    dependencies?: Array<string>
    softDependencies?: Array<string>
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
    logParser?: {
      unhealthy?: string
      possiblyHealthy?: string
      timestamp?: string
    }
  }>
  extends?: Array<string>
}
export const configV3Hash = 'cd105a3be6063c0ef00d3e9b52e55ebe21f56f0ea7904e0a2963c5c02762003e'