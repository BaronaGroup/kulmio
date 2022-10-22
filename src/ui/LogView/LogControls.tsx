import { ViewSelect } from '../ViewSelect'
import { ServiceSelection } from './ServiceSelection'

export const LogControls: React.FC<{ services: string[]; onSetServices(services: string[]): void }> = (props) => {
  return (
    <div className="bg-slate-200 w-[200px] text-left p-2 select-none">
      <div>
        <ViewSelect />
      </div>
      Mode
      <div>
        <label>
          <input type="radio" name="mode" /> Live
        </label>
      </div>
      <div>
        <label>
          <input type="radio" name="mode" checked /> Paused
        </label>
      </div>
      <div>
        <label>
          <input type="radio" name="mode" /> Specific moment
        </label>
      </div>
      <hr />
      Services
      <ServiceSelection {...props} />
    </div>
  )
}
