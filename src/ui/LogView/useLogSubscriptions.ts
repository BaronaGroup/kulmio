import { useContext, useEffect, useRef } from 'react'
import { v4 as uuid } from 'uuid'

import { useAppState } from '../appState'
import { dataContext } from '../data/DataContext'
import { socket } from '../socketio'
import { useRerender } from '../utils/useRerender'

export function useLogSubscriptions() {
  const [maxLinesPerService] = useAppState('logView.numberOfLines')
  const [isTailing] = useAppState('logView.isTailing')

  const [services] = useAppState('logView.activeServices')

  const allServices = useContext(dataContext).services.map((s) => s.name)

  const activeSubscriptions = useRef<Record<string, string | null>>({})
  const rerender = useRerender()
  useEffect(() => {
    const handleDisconnect = () => {
      activeSubscriptions.current = {}
      socket.once('connect', () => {
        rerender()
      })
    }
    socket.on('disconnect', handleDisconnect)
    return () => {
      socket.off('disconnect', handleDisconnect)
    }
  })

  useEffect(() => {
    for (const service of allServices) {
      const subId = activeSubscriptions.current[service]
      const wanted = isTailing && services.includes(service)
      if (!subId && wanted) {
        const newSubId = uuid()
        activeSubscriptions.current[service] = newSubId
        socket.emit('subscribeToLogs', { service, id: newSubId, sendLines: maxLinesPerService })
      } else if (subId && !wanted) {
        socket.emit('unsubscribeFromLogs', { id: subId })

        // eslint-disable-next-line react-hooks/exhaustive-deps
        activeSubscriptions.current[service] = null
      }
    }
  }, [activeSubscriptions, allServices, isTailing, maxLinesPerService, services])

  useEffect(() => {
    return () => {
      for (const id of Object.values(activeSubscriptions.current)) {
        if (id) {
          socket.emit('unsubscribeFromLogs', { id })
        }
      }
      activeSubscriptions.current = {}
    }
  }, [])
}
