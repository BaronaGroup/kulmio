import fs from 'fs'

import Tail from '@logdna/tail-file'
import { Socket } from 'socket.io'
import split2 from 'split2'

import { ClientToServerEvents, ServerToClientEvents } from '../../common/events'
import ServerModel from '../ServerModel'

type Client = Socket<ClientToServerEvents, ServerToClientEvents>

const logTails = new Map<
  string,
  {
    service: string
    tail: Tail
    subscriptions: Array<{
      id: string
      client: Client
    }>
  }
>()

export function subscribeToLogs(client: Client, model: ServerModel, service: string, id: string) {
  const existing = logTails.get(service)
  if (existing) {
    existing.subscriptions.push({ client, id })
  }

  const tail = createTail(service, model)
  logTails.set(service, { service, tail, subscriptions: [{ client, id }] })
  console.log('Starting tailing: ' + service)
  tail.start()
}

export function unsubscribeFromLogs(id: string) {
  const logTail = Array.from(logTails.values()).find((lt) => lt.subscriptions.some((sub) => sub.id === id))
  if (!logTail) return
  if (logTail.subscriptions.length === 1) {
    console.log('Stopping tailing: ' + logTail.service)
    logTail.tail.quit()
    logTails.delete(logTail.service)
  }
  const subIndex = logTail.subscriptions.findIndex((sub) => sub.id === id)

  logTail.subscriptions.splice(subIndex, 1)
}
export function unsubscribeFromAllLogs(client: Client) {
  for (const logTail of logTails.values()) {
    const sub = logTail.subscriptions.find((sub) => sub.client === client)
    if (sub) {
      unsubscribeFromLogs(sub.id)
    }
  }
}

function createTail(service: string, model: ServerModel) {
  // TODO: support actual offsets
  let index = 0
  const logFile = model.getService(service).logFile
  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, '', 'utf-8')
  }
  const tail = new Tail(logFile)
  tail.pipe(split2()).on('data', (line) => {
    console.log('line', line)
    if (!line) return
    const myIndex = ++index
    const logTail = logTails.get(service)
    if (logTail) {
      for (const sub of logTail.subscriptions) {
        sub.client.emit('newLogEvents', {
          logEvents: [{ timestamp: findTimestamp(line) ?? new Date().valueOf(), offset: myIndex, service, line }],
          isInitialBatch: false,
        })
      }
    }
  })

  return tail
}

const timestampFinder1 = /\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d\d\d(Z|\+\d\d:\d\d)/
const timestampFinder2 = /(\d\d)\/(\w\w\w)\/(\d\d\d\d):(\d\d):(\d\d):(\d\d) \+0000/
function findTimestamp(line: string): number | null {
  const match1 = line.match(timestampFinder1)
  if (match1?.[0]) return new Date(match1[0]).valueOf()

  const match2 = line.match(timestampFinder2)
  if (match2) {
    const [, day, monthStr, year, hours, minutes, seconds] = match2
    const month = {
      Jan: '01',
      Feb: '02',
      Mar: '03',
      Apr: '04',
      May: '05',
      Jun: '06',
      Jul: '07',
      Aug: '08',
      Sep: '09',
      Oct: '10',
      Nov: '11',
      Dec: '12',
    }[monthStr]
    return new Date(`${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`).valueOf()
  }
  return null
}
