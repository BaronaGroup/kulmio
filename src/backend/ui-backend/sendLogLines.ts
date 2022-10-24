import fs from 'fs'

import { Socket } from 'socket.io'

import { ClientToServerEvents, ServerToClientEvents } from '../../common/events'
import ServerModel from '../ServerModel'
import { findTimestamp } from './logSubscriptions'

const BUFFER_SIZE = 8000

export async function sendLogLines(
  client: Socket<ClientToServerEvents, ServerToClientEvents>,
  model: ServerModel,
  serviceName: string,
  maxLines: number
) {
  const service = model.getService(serviceName)
  if (!service) return

  const { logFile } = service

  const fd = await fs.promises.open(logFile, 'r')
  const fileSize = (await fd.stat()).size

  let combinedBuffer = new Buffer(0)
  const readBuffer = new Buffer(BUFFER_SIZE)
  while (combinedBuffer.filter((x) => x === 10).length < maxLines) {
    const position = Math.max(fileSize - combinedBuffer.length - BUFFER_SIZE, 0)

    await fd.read({ buffer: readBuffer, position: position })
    combinedBuffer = Buffer.concat([readBuffer, combinedBuffer])

    if (position === 0) break
  }
  const lineChangeAt = combinedBuffer.indexOf(10)
  if (lineChangeAt === -1) return
  const lines = combinedBuffer
    .subarray(lineChangeAt + 1)
    .toString('utf-8')
    .split('\n')

  let offset = fileSize - combinedBuffer.length + lineChangeAt + 1
  client.emit('newLogEvents', {
    isInitialBatch: true,
    logEvents: lines
      .map((line) => {
        const offsetBefore = offset
        offset += line.length + 1
        return {
          line,
          service: serviceName,
          offset: offsetBefore,
          timestamp: findTimestamp(line) ?? undefined,
        }
      })
      .slice(-maxLines),
  })
}
