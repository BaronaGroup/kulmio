import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import z from 'zod'

import { SortCriteria } from './ServiceList/SortCriteria'
import { PathOf, TypeByPath } from './utils/typePaths'

export enum ServiceViewMode {
  VERTICAL = 'VERTICAL',
  CLUSTERED = 'CLUSTERED',
}

const appStateSchema = z.object({
  serviceView: z
    .object({
      groupsEnabled: z.boolean().default(true),
      viewMode: z.nativeEnum(ServiceViewMode).default(ServiceViewMode.CLUSTERED),
      sortCriteria: z.nativeEnum(SortCriteria).default(SortCriteria.NAME),
    })
    .optional()
    .default({}),
})

type DeepPartialAppState = z.infer<ReturnType<typeof appStateSchema.deepPartial>>

export type AppState = z.infer<typeof appStateSchema>

const localStorageName = 'kulmio-ui-state'

const defaultState = appStateSchema.parse({})

interface Ctx {
  data: AppState
  updateState(updatedState: DeepPartialAppState): void
}

const context = React.createContext<Ctx>(null as any)

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const initialState = useMemo<AppState>(() => {
    const data = JSON.parse(localStorage.getItem(localStorageName) || '{}')
    const parsed = appStateSchema.safeParse(data)
    return parsed.success ? parsed.data : defaultState
  }, [])

  const [state, setState] = useState<AppState>(initialState)

  const updateState = useCallback((newState: DeepPartialAppState) => {
    setState((oldState) => ({
      serviceView: { ...oldState.serviceView, ...newState.serviceView },
    }))
  }, [])

  useEffect(() => {
    localStorage.setItem(localStorageName, JSON.stringify(state))
  }, [state])

  const value = useMemo<Ctx>(() => ({ data: state, updateState }), [state, updateState])
  return <context.Provider value={value}>{children}</context.Provider>
}

export function useAppState<TPath extends PathOf<AppState>>(
  path: TPath
): [TypeByPath<AppState, TPath>, (newValue: TypeByPath<AppState, TPath>) => void] {
  const { data, updateState } = useContext(context)
  const value = useMemo(() => {
    const pathBits = path.split('.')
    return pathBits.reduce<any>((value, pathElem) => {
      return value[pathElem]
    }, data)
  }, [data, path])

  const updateValue = useCallback(
    (value: any) => {
      const pathBits = path.split('.').reverse()
      const updatedWrappedValue = pathBits.slice(1).reduce<any>(
        (value, pathElem) => {
          return { [pathElem]: value }
        },
        { [pathBits[0]]: value }
      )
      updateState(updatedWrappedValue)
    },
    [path, updateState]
  )

  return [value, updateValue]
}
