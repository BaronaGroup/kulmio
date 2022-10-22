import { useEffect } from 'react'
import { Socket, io } from 'socket.io-client'

import { ClientToServerEvents, ServerToClientEvents } from '../common/events'

const socketUrl = decodeURIComponent(document.location.search.match(/server=([^&]+)/)?.[1] || '')

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(socketUrl)

export function useSocketEventHandler<T extends keyof ServerToClientEvents>(
  eventType: T,
  handler: (data: Parameters<ServerToClientEvents[T]>[0]) => void
) {
  useEffect(() => {
    const handlerInstance: any = (event: any) => {
      handler(event)
    }
    socket.on(eventType, handlerInstance)
    return () => {
      socket.off(eventType, handlerInstance)
    }
  }, [eventType, handler])
}
