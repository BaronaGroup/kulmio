import { useCallback, useContext } from 'react'

import { selectionContext, useIsSelected } from './SelectionContext'

export const SelectionCheckbox: React.FC<{ item: string }> = ({ item }) => {
  const isChecked = useIsSelected(item)
  const { select, unselect } = useContext(selectionContext)

  const toggle = useCallback(() => {
    if (isChecked) unselect(item)
    else select(item)
  }, [isChecked, item, select, unselect])

  return <input type="checkbox" checked={isChecked} onChange={toggle} />
}
