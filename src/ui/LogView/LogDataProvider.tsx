import React, { ReactNode, useMemo, useState } from 'react'

export interface LogEvent {
  service: string
  line: string
  timestamp?: number
}

interface Ctx {
  logLines: LogEvent[]
}

export const logDataContext = React.createContext<Ctx>(null as any)

export const LogDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logLines] = useState<LogEvent[]>([])
  const value = useMemo<Ctx>(() => ({ logLines }), [logLines])
  return <logDataContext.Provider value={value}>{children}</logDataContext.Provider>
}
