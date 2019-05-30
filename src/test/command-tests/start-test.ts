import path from 'path'
import {runWithArgs} from '../../app'
import {createTestService, createTestServerHelper, until} from '../test-utils'
import {Config} from '../../config'

const wsPort = 10000

const testSetName = path.basename(__filename, '.ts')

export const kulmioConfig: Config = {
  schema: 'V1',
  config: {
    screenSuffix: testSetName,
    baseDir: '/tmp/' + testSetName,
  },
  services: [
    createTestService('test1', wsPort),
    createTestService('test2', wsPort),
    createTestService('test3', wsPort),
  ],
}

describe(testSetName, () => {
  const testUtil = createTestServerHelper(wsPort)

  beforeAll(testUtil.setup)
  afterAll(testUtil.destroy)

  it('is possible to start individual services', async function() {
    jest.setTimeout(10000)
    await runWithArgs({
      configFile: __filename,
      args: [],
      command: 'start',
      services: ['test1'],
    })

    await until(() => testUtil.serviceIsRunning('test1'))
    await testUtil.stopService('test1')
  })

  it('is possible to start multiple services', async function() {
    jest.setTimeout(10000)
    await runWithArgs({
      configFile: __filename,
      args: [],
      command: 'start',
      services: ['test1', 'test3'],
    })

    await until(() => testUtil.serviceIsRunning('test1'))
    await until(() => testUtil.serviceIsRunning('test3'))
    await until(() => !testUtil.serviceIsRunning('test2'))
    await testUtil.stopService('test1')
    await testUtil.stopService('test3')
  })
})
