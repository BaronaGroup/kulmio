import React, { useCallback, useContext } from 'react'

import { ActionButton, CommandSet } from '../components/CommandSet'
import { selectionContext } from '../selection/SelectionContext'

export const SelectedItemTools: React.FC = () => {
  const { selected, unselect } = useContext(selectionContext)

  const unselectAll = useCallback(() => {
    for (const item of selected) {
      unselect(item)
    }
  }, [selected, unselect])

  if (!selected.length) return null

  return (
    <div className="fixed bottom-0 bg-slate-200 left-0 right-0 py-4">
      {selected.length} {selected.length === 1 ? 'service' : 'services'} selected. <CommandSet />
      <ActionButton onClick={unselectAll}>Unselect all</ActionButton>
    </div>
  )
}
