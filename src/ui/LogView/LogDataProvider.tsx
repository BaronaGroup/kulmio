import bs from 'binary-search'
import produce from 'immer'
import escapeRegExp from 'lodash/escapeRegExp'
import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { LogEvent } from '../../common/events'
import { FilterType, useAppState } from '../appState'
import { useSocketEventHandler } from '../socketio'
import { useLogSubscriptions } from './useLogSubscriptions'

interface Ctx {
  logLines: LogEvent[]
}

export const logDataContext = React.createContext<Ctx>({} as any)

export const LogDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [maxLinesPerService] = useAppState('logView.numberOfLines')
  const [services] = useAppState('logView.activeServices')
  const [isTailing] = useAppState('logView.isTailing')
  const [filterText] = useAppState('logView.filterText')
  const [filterType] = useAppState('logView.filterType')

  const serviceSet = useMemo(() => new Set([...services, 'Kulmio']), [services])

  useLogSubscriptions()

  const [logLinesByService, setLoglinesByService] = useState<Record<string, LogEvent[]>>({})

  useEffect(() => {
    if (!isTailing) {
      setLoglinesByService((old) =>
        produce(old, (data) => {
          if (!data['Kulmio']) data['Kulmio'] = []
          data['Kulmio'].push({
            timestamp: new Date().valueOf(),
            service: 'Kulmio',
            offset: data['Kulmio'].length + 1,
            line: `-- Paused at ${new Date().toISOString()}, data may be missing -- `,
          })
        })
      )
    }
  }, [isTailing])
  useSocketEventHandler(
    'newLogEvents',
    useCallback(
      ({ logEvents }) => {
        setLoglinesByService((old) =>
          produce(old, (data) => {
            for (const event of logEvents) {
              if (!data[event.service]) data[event.service] = []
              const slogs = data[event.service]
              const index = figureOutIndex(event, slogs)
              if (index !== null) {
                const fixedEvent = {
                  ...event,
                  timestamp: event.timestamp || figureOutTimestamp(slogs, index),
                }
                slogs.splice(index, 0, fixedEvent)
                while (slogs.length > maxLinesPerService) {
                  slogs.shift()
                }
              }
            }
          })
        )
      },
      [maxLinesPerService]
    )
  )

  useEffect(() => {
    setLoglinesByService((old) =>
      produce(old, (data) => {
        for (const key of Object.keys(data)) {
          if (!serviceSet.has(key)) data[key] = []
        }
      })
    )
  }, [serviceSet])

  const logLines = useMemo(
    () =>
      applyFilter(
        ([] as LogEvent[])
          .concat(...Object.values(logLinesByService))
          .filter((line) => serviceSet.has(line.service))
          .sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0) || a.offset - b.offset),
        filterText,
        filterType
      ),
    [filterText, filterType, logLinesByService, serviceSet]
  )

  const value = useMemo<Ctx>(() => ({ logLines }), [logLines])
  return <logDataContext.Provider value={value}>{children}</logDataContext.Provider>
}

function figureOutIndex(event: LogEvent, events: LogEvent[]) {
  const location = bs(events, event, (a, b) => a.offset - b.offset)
  if (location > 0) return null
  return -location - 1
}

function figureOutTimestamp(events: LogEvent[], nearIndex: number) {
  for (let i = nearIndex; i >= 0; --i) {
    if (events[i]?.timestamp) return events[i].timestamp
  }
  for (let i = nearIndex + 1; i < events.length; ++i) {
    if (events[i].timestamp) return events[i].timestamp
  }
  return 0
}

const matchAnyString = /.{0}/
const matchNothing = /^.^/

const filterImpls: Record<FilterType, (filterText: string) => { filterRegex: RegExp; highlightRegex?: RegExp }> = {
  [FilterType.TEXT]: (filterText) => ({ filterRegex: new RegExp(escapeRegExp(filterText), 'gi') }),
  [FilterType.TEXT_SENSITIVE]: (filterText) => ({ filterRegex: new RegExp(escapeRegExp(filterText), 'g') }),
  [FilterType.REGEX]: (filterText) => ({
    filterRegex: constructRegexp(filterText, 'gi'),
  }),
  [FilterType.HIGHLIGHT]: (filterText) => ({
    filterRegex: matchAnyString,
    highlightRegex: new RegExp(escapeRegExp(filterText), 'gi'),
  }),
}

function constructRegexp(input: string, suggestedFlags: string) {
  try {
    const match = input.match(/^\/(.+)\/(\w+)$/)
    if (!match) return new RegExp(input, suggestedFlags)

    return new RegExp(match[1], match[2])
  } catch (err) {
    try {
      return new RegExp(input, suggestedFlags)
    } catch (err) {
      return matchNothing
    }
  }
}

function applyFilter(lines: LogEvent[], filterText: string, filterType: FilterType) {
  if (!filterText) return lines

  const { filterRegex, highlightRegex = filterRegex } = filterImpls[filterType](filterText)
  const pass1 = lines.map((line) => {
    const isMatch = line.line.match(filterRegex)
    if (!isMatch) return null
    return {
      ...line,
      line: line.line.replace(highlightRegex, (match) => `\u001b[33;1m\u001b[41m${match}\u001b[0m`),
    }
  })

  const output: LogEvent[] = []
  let filteredNow = 0
  for (const line of pass1) {
    if (line === null) filteredNow++
    else {
      output.push({ ...line, meta: { ...line.meta, skipped: filteredNow } })
      filteredNow = 0
    }
  }
  if (filteredNow) {
    output.push({
      service: 'Kulmio',
      offset: 10000,
      line: `${filteredNow} lines filtered out from the end.`,
    })
  }
  return output
}
