import { useMemo } from 'react'

import { FilterType, useAppState } from '../appState'

export const LogFilter: React.FC = () => {
  const [filterText, setFilterText] = useAppState('logView.filterText')
  const [type, setType] = useAppState('logView.filterType')
  const isInvalid = useMemo(() => {
    if (type !== FilterType.REGEX) return false
    if (!filterText) return false

    try {
      new RegExp(filterText)
      return false
    } catch (e) {
      return true
    }
  }, [filterText, type])
  return (
    <div className="bg-slate-200 p-2 flex space-x-2">
      <div>Filter</div>
      <input
        className={`grow px-2 ${isInvalid && 'bg-red-200'}`}
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />
      <div>
        <select className="bg-slate-200" value={type} onChange={(e) => setType(e.target.value as any)}>
          <option value={FilterType.TEXT}>Text</option>
          <option value={FilterType.TEXT_SENSITIVE}>Text (case sensitive)</option>
          <option value={FilterType.REGEX}>Regex</option>
          <option value={FilterType.HIGHLIGHT}>Highlight</option>
        </select>
      </div>
    </div>
  )
}
