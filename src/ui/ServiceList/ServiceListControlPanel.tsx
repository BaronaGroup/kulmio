import { Select, SelectOption } from '../components/Select'
import { SortCriteria } from './SortCriteria'

const sortOptions: Array<SelectOption<SortCriteria>> = [
  { label: 'Name', value: SortCriteria.NAME },
  { label: 'Status', value: SortCriteria.STATUS },
]

export const ServiceListControlPanel: React.FC<{
  isGroupsEnabled: boolean
  toggleGroups(): void
  isListVertical: boolean
  toggleVerticalList(): void
  sortBy: SortCriteria
  setSortBy(newCriteria: SortCriteria): void
}> = ({ isGroupsEnabled, toggleGroups, sortBy, setSortBy, isListVertical, toggleVerticalList }) => {
  return (
    <div className="py-4 bg-slate-200 flex px-4 space-x-3">
      <div>
        <label>
          <input type="checkbox" checked={isGroupsEnabled} onChange={toggleGroups} /> Use groups
        </label>
      </div>
      <Separator />
      <div>
        Sort by <Select options={sortOptions} onChange={setSortBy} value={sortBy} />
      </div>
      <Separator />
      <div>
        <label>
          <input type="checkbox" checked={isListVertical} onChange={toggleVerticalList} /> Vertical list
        </label>
      </div>
    </div>
  )
}

const Separator: React.FC = () => <div className="border border-slate-400" />
