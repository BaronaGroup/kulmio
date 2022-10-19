import { ServiceSelection } from './ServiceSelection'

export const LogControls: React.FC<{ services: string[]; onSetServices(services: string[]): void }> = (props) => {
  return (
    <div className="bg-slate-800 w-[200px] text-left p-2 text-blue-200 select-none">
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
