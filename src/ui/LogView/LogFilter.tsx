import { FilterType, useAppState } from '../appState'

export const LogFilter: React.FC = () => {
  const [filterText, setFilterText] = useAppState('logView.filter.text')
  const [type, setType] = useAppState('logView.filter.type')
  return (
    <div className="bg-slate-200 p-2  flex space-x-2">
      <div>Filter</div>
      <input className="grow px-2" value={filterText} onChange={(e) => setFilterText(e.target.value)} />
      <div>
        <select className="bg-slate-200" value={type} onChange={(e) => setType(e.target.value as any)}>
          <option value={FilterType.TEXT}>Text</option>
          <option value={FilterType.REGEX}>Regex</option>
        </select>
      </div>
    </div>
  )
}
