import { useContext } from 'react'

import { getServiceColorClass } from '../visuals/getServiceColorClass'
import { logDataContext } from './LogDataProvider'

export const LogData: React.FC = () => {
  const { logLines } = useContext(logDataContext)
  return (
    <div className="text-left p-4 grow">
      {logLines.map((entry, i) => (
        <div key={i} className="flex">
          <div className={`whitespace-pre-wrap font-mono  ${getServiceColorClass(entry.service)} grow`}>
            {entry.line}
          </div>
          <div className="text-sm">{entry.service}</div>
        </div>
      ))}
      {!logLines.length && <p>No log entries.</p>}
    </div>
  )
}
