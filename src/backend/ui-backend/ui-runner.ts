import express from 'express'
import { Server as SocketServer } from 'socket.io'

import { ClientToServerEvents, ServerToClientEvents } from '../../common/events'
import ServerModel from '../ServerModel'

export function startUIRunner(model: ServerModel) {
  const { uiPort } = model.config
  if (!uiPort) throw new Error('Configuration does not specify UI port')
  const app = express()

  app.get('/', (_req, res) => {
    res.send('Hello World!')
  })

  const server = app.listen(uiPort, '127.0.0.1', () => {
    console.log(`Kulmio UI at http://127.0.0.1:${uiPort}`)
  })

  new SocketServer<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  }).on('connection', (client) => {
    client.on('listServices', () => {
      client.emit('updateServiceList', {
        services: model.services.map((s) => ({
          name: s.name,
          groups: s.config.groups ?? [],
        })),
      })
    })

    client.on('checkServiceStatus', async ({ service: serviceName }) => {
      const service = model.services.find((s) => s.name === serviceName)
      if (service) {
        const status = await service.getStatus()
        client.emit('updateServiceStatus', { service: serviceName, status })
      }
    })
  })
}
