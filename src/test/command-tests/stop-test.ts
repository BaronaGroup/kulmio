import path from 'path'
import { createTestService, createTestServerHelper, runKulmio, until } from '../test-utils'
import { Config } from '../../config'

const wsPort = 10001

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

  beforeEach(async function() {
    await runKulmio(__filename, 'start')
    await testUtil.waitForServices(['test1', 'test2', 'test3'])
    testUtil.resetHistory()
  })

  it('is possible to stop individual services', async function() {
    jest.setTimeout(10000)
    await runKulmio(__filename, 'stop', ['test2'])
    await until(() => !testUtil.serviceIsRunning('test2'))
    testUtil.verifyConnections([['-test2']])
  })
})
