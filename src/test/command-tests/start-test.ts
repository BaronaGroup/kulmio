import path from 'path'
import {createTestService, createTestServerHelper, until, runKulmio} from '../test-utils'
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
    createTestService('testExplicit', wsPort, {excludeFromAll: true}),
    createTestService('test2', wsPort),
    createTestService('test3', wsPort),
  ],
}

describe(testSetName, () => {
  const testUtil = createTestServerHelper(wsPort)

  beforeAll(testUtil.setup)
  afterAll(testUtil.destroy)
  beforeEach(testUtil.resetHistory)
  afterEach(testUtil.stopAllServices)

  it('is possible to start individual services', async function() {
    jest.setTimeout(10000)
    await runKulmio(__filename, 'start', ['test1'])

    await until(() => testUtil.serviceIsRunning('test1'))
    testUtil.verifyConnections([['test1']])
  })

  it('is possible to start services with explicit start', async function() {
    jest.setTimeout(10000)
    await runKulmio(__filename, 'start', ['testExplicit'])

    await until(() => testUtil.serviceIsRunning('testExplicit'))
    testUtil.verifyConnections([['testExplicit']])
  })

  it('is possible to start multiple services', async function() {
    jest.setTimeout(10000)
    await runKulmio(__filename, 'start', ['test1', 'test3'])

    await until(() => testUtil.serviceIsRunning('test1'))
    await until(() => testUtil.serviceIsRunning('test3'))
    testUtil.verifyConnections([['test1', 'test3']])
  })

  it('by default starts all services (except those with explicit start)', async function() {
    jest.setTimeout(10000)
    await runKulmio(__filename, 'start')

    await until(() => testUtil.serviceIsRunning('test1'))
    await until(() => testUtil.serviceIsRunning('test3'))
    await until(() => testUtil.serviceIsRunning('test2'))
    testUtil.verifyConnections([['test1', 'test2', 'test3']])
  })
})
