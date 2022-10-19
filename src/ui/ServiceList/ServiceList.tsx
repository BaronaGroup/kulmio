import { SelectedItemTools } from './SelectedItemTools'
import { ServiceGroup } from './ServiceGroup'
import { useServiceControls } from './useServiceControls'

export const ServiceList: React.FC = () => {
  const { serviceGroups, ControlPanel, isListVertical } = useServiceControls()
  return (
    <div>
      <ControlPanel />
      {serviceGroups.map((g) => (
        <ServiceGroup key={g.name} group={g} vertical={isListVertical} />
      ))}
      <SelectedItemTools />
    </div>
  )
}
