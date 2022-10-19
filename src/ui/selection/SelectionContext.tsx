import React, { ReactNode, useCallback, useContext, useMemo, useState } from 'react'

interface Ctx {
  selected: string[]
  select(item: string): void
  unselect(item: string): void
}

export const selectionContext = React.createContext<Ctx>(null as unknown as Ctx)

export const SelectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selected, setSelected] = useState<string[]>([])

  const select = useCallback<Ctx['select']>((item) => setSelected((v) => [...v, item]), [])
  const unselect = useCallback<Ctx['unselect']>((item) => setSelected((v) => v.filter((i) => i !== item)), [])

  const value = useMemo<Ctx>(() => ({ selected, select, unselect }), [select, selected, unselect])
  return <selectionContext.Provider value={value}>{children}</selectionContext.Provider>
}

export function useIsSelected(item: string) {
  return useContext(selectionContext).selected.includes(item)
}
