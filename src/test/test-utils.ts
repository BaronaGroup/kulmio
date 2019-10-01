import { TestServerAPI, startServer, MetaCommand } from './test-server'
import { WSClientToServerCommand } from './ws-commands'
import { ServiceConfig } from '../config'
import { runWithArgs } from '../app'
import {delay} from '../utils/delay'

export function createTestService(
  name: string,
  serverPort: number,
  customizations?: Partial<ServiceConfig>
): ServiceConfig {
  return {
    name,
    workDir: __dirname + '/../../build/src/test/test-app',
    command: 'node test-app',
    ...(customizations || {}),
    env: {
      WS_SERVER_PORT: serverPort.toString(),
      CLIENT_ID: name,
      ...(customizations && customizations.env ? customizations.env : {}),
    },
  }
}

export function createTestServerHelper(port: number) {
  let testServer: TestServerAPI | null = null
  const activeClients = new Set<string>()
  const connectionHistory: string[] = []

  return {
    setup,
    destroy() {
      if (!testServer) throw new Error('Test server not running')
      testServer.close()
    },
    stopService,
    serviceIsRunning,
    stopAllServices,
    getConnectedServices,
    resetHistory: () => connectionHistory.splice(0, connectionHistory.length),
    verifyConnections,
    waitForServices,
  }

  async function setup() {
    testServer = await startServer(port, handleCommand)
  }

  function handleCommand(clientId: string, command: WSClientToServerCommand | MetaCommand) {
    switch (command.command) {
      case 'hello':
        activeClients.add(clientId)
        connectionHistory.push(clientId)
        break
      case 'connection-closed':
        connectionHistory.push('-' + clientId)
        activeClients.delete(clientId)
    }
  }

  function serviceIsRunning(service: string) {
    return activeClients.has(service)
  }

  async function stopService(service: string) {
    if (!testServer) throw new Error('Test server not running')
    if (!activeClients.has(service)) throw new Error(service + 'not running, cannot stop it')
    testServer.sendCommand(service, { command: 'exit' })

    await until(() => !serviceIsRunning(service))
  }

  async function stopAllServices() {
    while (activeClients.size > 0) {
      await stopService([...activeClients.values()][0])
    }
  }

  function getConnectedServices() {
    return [...activeClients.values()].sort()
  }

  function verifyConnections(expected: string[][]) {
    const connections = [...connectionHistory]
    for (const set of expected) {
      const workingSet = [...set]
      while (workingSet.length) {
        if (!connections.length) throw new Error('Expected: ' + workingSet.join(', ') + '; got nothing')
        const at = workingSet.indexOf(connections[0])
        if (at !== -1) {
          workingSet.splice(at, 1)
          connections.splice(0, 1)
        } else {
          throw new Error('Expected: ' + workingSet.join(', ') + '; got ' + connections[0])
        }
      }
    }
  }

  async function waitForServices(services: string[]) {
    for (const service of services) {
      await until(() => serviceIsRunning(service))
    }
  }
}

export async function until(condition: () => boolean | Promise<boolean>) {
  while (!(await condition())) {
    await delay(10)
  }
}

export function runKulmio(configFile: string, command: string, services: string[] = [], args: string[] = []) {
  return runWithArgs({
    configFile,
    args,
    command,
    services,
  })
}
