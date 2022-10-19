import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { ServiceStatus } from '../../common/types'
import { socket, useSocketEventHandler } from '../socketio'

export interface Service {
  name: string
  status: ServiceStatus
  groups: string[]
}

interface Ctx {
  services: Service[]
}

export const dataContext = React.createContext<Ctx>(null as unknown as Ctx)

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Ctx['services'] | null>(null)

  useEffect(() => {
    if (!services) socket.emit('listServices')
  }, [services])

  useSocketEventHandler(
    'updateServiceList',
    useCallback((data) => {
      setServices((oldServices) => {
        return data.services.map((service) => {
          const existing = oldServices?.find((s) => s.name === service.name)
          return { ...service, status: existing?.status || 'UNKNOWN' }
        })
      })
    }, [])
  )

  useSocketEventHandler(
    'updateServiceStatus',
    useCallback((update) => {
      setServices(
        (oldServices) =>
          oldServices && [...oldServices.map((s) => (s.name !== update.service ? s : { ...s, status: update.status }))]
      )
    }, [])
  )

  const value = useMemo<Ctx>(() => ({ services: services ?? [] }), [services])

  if (!services) return <h1>Loading...</h1>

  return <dataContext.Provider value={value}>{children}</dataContext.Provider>
}
