import { ServiceViewMode, useAppState } from '../appState'
import { ViewSelect } from '../ViewSelect'
import { SelectedItemTools } from './SelectedItemTools'
import { ServiceGroup } from './ServiceGroup'
import { useServiceControls } from './useServiceControls'

export const ServiceList: React.FC = () => {
  const { serviceGroups, ControlPanel } = useServiceControls()
  const [viewMode] = useAppState('serviceView.viewMode')

  return (
    <div>
      <div className={'absolute top-1 left-1'}>
        <ViewSelect />
      </div>
      <ControlPanel />
      {serviceGroups.map((g) => (
        <ServiceGroup key={g.name} group={g} vertical={viewMode === ServiceViewMode.VERTICAL} />
      ))}
      <SelectedItemTools />
    </div>
  )
}
