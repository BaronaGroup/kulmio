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
  }>
  extends?: Array<string>
}
export const configV1Hash = 'b0735d575913782d5c5d31b1e2f0737610a4238ff459b8258e63ada6a81a0bce'