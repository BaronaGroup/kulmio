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
    uiPort?: number
  }
  services: Array<{

  }>
  extends?: Array<string>
}
export const configV2Hash = 'c3f1fb3092ce2363b388873e3e052decec0605cbb99c227ef7a9f180ff41213e'