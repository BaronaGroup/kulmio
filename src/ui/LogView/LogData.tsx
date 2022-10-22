import Ansi from 'ansi-to-react'
import { useContext } from 'react'

import { getServiceColorClass } from '../visuals/getServiceColorClass'
import { logDataContext } from './LogDataProvider'

export const LogData: React.FC = () => {
  const { logLines } = useContext(logDataContext)
  return (
    <div className="text-left p-4 grow">
      {logLines.map((entry) => (
        <div key={`${entry.service}-${entry.offset}`} className="flex">
          <div className={`whitespace-pre-wrap font-mono  ${getServiceColorClass(entry.service)} grow`}>
            <Ansi>{entry.line}</Ansi>
          </div>
          {entry.meta?.skipped ? <div className={'text-sm mr-2'}>skip +{entry.meta.skipped}</div> : ''}
          <div className="text-sm">{entry.service}</div>
        </div>
      ))}
      {!logLines.length && <p>No log entries.</p>}
    </div>
  )
}
