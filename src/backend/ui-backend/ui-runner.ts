import fs from 'fs'

import Tail from '@logdna/tail-file'
import express from 'express'
import { Server as SocketServer } from 'socket.io'
import split2 from 'split2'

import { ClientToServerEvents, ServerToClientEvents } from '../../common/events'
import { LogEvent, getEventLogFilename } from '../eventLogger'
import ServerModel from '../ServerModel'
import { startServices } from '../startService'
import { subscribeToLogs, unsubscribeFromAllLogs, unsubscribeFromLogs } from './logSubscriptions'

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

  const socketServer = new SocketServer<ClientToServerEvents, ServerToClientEvents>(server, {
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

    client.on('stopServices', async ({ services, force = false }) => {
      await Promise.all(
        services.map(async (serviceName) => {
          const service = model.getService(serviceName)
          const running = await service.isRunning()
          if (running) {
            service.stop(force)
          }
        })
      )
    })

    client.on('restartServices', async ({ services }) => {
      await Promise.all(
        services.map(async (serviceName) => {
          const service = model.getService(serviceName)
          await service.stop(false)
          await startServices([service], model)
        })
      )
    })

    client.on('startServices', async ({ services }) => {
      startServices(
        services.map((sn) => model.getService(sn)),
        model
      )
    })

    client.on('subscribeToLogs', async ({ service, id }) => {
      subscribeToLogs(client, model, service, id)
    })

    client.on('unsubscribeFromLogs', async ({ id }) => {
      unsubscribeFromLogs(id)
    })

    client.on('disconnect', () => {
      unsubscribeFromAllLogs(client)
    })
  })
  const eventLog = getEventLogFilename(model.config)
  if (!fs.existsSync(eventLog)) {
    fs.writeFileSync(eventLog, '', 'utf-8')
  }

  const tail = new Tail(eventLog)
  tail
    .on('tail_error', (err) => {
      console.error('TailFile had an error!', err)
      throw err
    })
    .start()
    .catch((err) => {
      console.error('Cannot start.  Does the file exist?', err)
      throw err
    })

  // Data won't start flowing until piping

  tail.pipe(split2()).on('data', (line) => {
    if (!line) return
    const lineData: LogEvent = JSON.parse(line)
    switch (lineData.type) {
      case 'STATUS_UPDATED':
        socketServer.emit('updateServiceStatus', { service: lineData.serviceName, status: lineData.status })
        break
    }
  })
}
