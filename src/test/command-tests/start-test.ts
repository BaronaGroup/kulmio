import path from 'path'
import {Config} from '../../ServerModel'
import {runWithArgs} from '../../app'
import {createTestService, createTestServerHelper, until} from '../test-utils'

const wsPort = 10000

export const kulmioConfig: Config = {
  config: {
    baseDir: '/tmp/' + path.basename(__filename, '.ts'),
  },
  services: [createTestService('test1', wsPort)],
}

describe(path.basename(__filename, '.ts'), () => {
  const testUtil = createTestServerHelper(wsPort)

  beforeAll(testUtil.setup)
  afterAll(testUtil.destroy)

  it('is possible to start individual services', async function() {
    await runWithArgs({
      configFile: __filename,
      args: [],
      command: 'start',
      services: ['test1'],
    })

    await until(() => testUtil.serviceIsRunning('test1'))
    await testUtil.stopService('test1')
  })
})
