import {ServiceConfig} from '../Service'
import {TestServerAPI, startServer, MetaCommand} from './test-server'
import {WSClientToServerCommand} from './ws-commands'

export function createTestService(name: string, serverPort: number): ServiceConfig {
  return {
    name,
    workDir: __dirname + '/../../build/test/test-app',
    command: 'node test-app',
    env: {
      WS_SERVER_PORT: serverPort.toString(),
      CLIENT_ID: name,
    },
  }
}

export function createTestServerHelper(port: number) {
  let testServer: TestServerAPI | null = null
  const activeClients = new Set()

  return {
    setup,
    destroy() {
      if (!testServer) throw new Error('Test server not running')
      testServer.close()
    },
    async stopService(service: string) {
      if (!testServer) throw new Error('Test server not running')
      if (!activeClients.has(service)) throw new Error(service + 'not running, cannot stop it')
      testServer.sendCommand(service, {command: 'exit'})

      await until(() => !serviceIsRunning(service))
    },
    serviceIsRunning,
  }

  async function setup() {
    testServer = await startServer(port, handleCommand)
  }

  function handleCommand(clientId: string, command: WSClientToServerCommand | MetaCommand) {
    switch (command.command) {
      case 'hello':
        activeClients.add(clientId)
        break
      case 'connection-closed':
        activeClients.delete(clientId)
    }
  }

  function serviceIsRunning(service: string) {
    return activeClients.has(service)
  }
}

export async function until(condition: () => boolean | Promise<boolean>) {
  while (!(await condition())) {
    await delay(10)
  }
}

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
