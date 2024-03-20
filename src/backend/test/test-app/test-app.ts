import { client as WebSocketClient } from 'websocket'

import { WSClientToServerCommand, WSServerToClientCommand } from '../ws-commands'

const wsServerPort = process.env.WS_SERVER_PORT,
  clientId = process.env.CLIENT_ID || 'unspecified'

const client = new WebSocketClient()

client.on('connectFailed', (err) => {
  console.log('Connection failed: ' + err)
})

client.on('connect', (connection) => {
  console.log('Connected')
  sendCommand({ command: 'hello', clientId })
  connection.on('error', (err) => {
    console.log('Connection error: ' + err)
  })

  connection.on('close', () => {
    console.log('Connection closed')
  })

  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      const data = JSON.parse(message.utf8Data as string) as WSServerToClientCommand
      switch (data.command) {
        case 'exit':
          connection.close()
        // eslint-disable-next-line no-fallthrough
        default:
          console.log('Invalid command', data.command)
          sendCommand({ command: 'error', message: 'Invalid command: ' + data.command })
      }
    }
  })

  function sendCommand(command: WSClientToServerCommand) {
    connection.sendUTF(JSON.stringify(command))
  }
})

console.log('Connecting')

client.connect(`ws://localhost:${wsServerPort}`, 'test-app')
