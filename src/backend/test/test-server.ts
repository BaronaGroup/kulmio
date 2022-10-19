import http from 'http'

import { connection as WebSocketConnection, server as WebSocketServer } from 'websocket'

import { PromisedType } from '../types'
import { WSClientToServerCommand, WSServerToClientCommand } from './ws-commands'

interface ConnectionClosed {
  command: 'connection-closed'
}

export type MetaCommand = ConnectionClosed

type HandleCommandFn = (clientId: string, command: WSClientToServerCommand | MetaCommand) => void

export type TestServerAPI = PromisedType<ReturnType<typeof startServer>>

export async function startServer(port: number, handleCommand: HandleCommandFn) {
  const server = http.createServer((_request, response) => {
    response.writeHead(404)
    response.end()
  })

  await new Promise<void>((resolve) => server.listen(port, resolve))

  const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false,
  })

  const connections = new Map<string, WebSocketConnection>()

  wsServer.on('request', (request) => {
    const connection = request.accept('test-app')

    let clientId: string

    connection.on('message', (message) => {
      if (message.type === 'utf8') {
        const command = JSON.parse(message.utf8Data as string) as WSClientToServerCommand

        switch (command.command) {
          case 'hello':
            clientId = command.clientId
            console.log('Client', clientId, 'connected')
            connections.set(clientId, connection)
        }

        handleCommand(clientId, command)
      }
    })

    connection.on('close', () => {
      console.log('Client', clientId, 'disconnected')
      handleCommand(clientId, { command: 'connection-closed' })
      connections.delete(clientId)
    })
  })

  console.log('Test server running at', port)

  return {
    sendCommand,
    broadcastCommand,
    close() {
      server.close()
    },
  }

  function broadcastCommand(command: WSServerToClientCommand) {
    for (const client of connections.keys()) {
      sendCommand(client, command)
    }
  }

  function sendCommand(clientId: string, command: WSServerToClientCommand) {
    const connection = connections.get(clientId)
    if (!connection) throw new Error('Client not connected')
    connection.sendUTF(JSON.stringify(command))
  }
}
