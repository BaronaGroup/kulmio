import Ansi from 'ansi-to-react'
import { useContext, useEffect, useLayoutEffect, useRef } from 'react'

import { LogEvent } from '../../common/events'
import { getServiceColorClass } from '../visuals/getServiceColorClass'
import { logDataContext } from './LogDataProvider'

export const LogData: React.FC<{ scrollElement: null | Element }> = ({ scrollElement }) => {
  const { logLines } = useContext(logDataContext)

  const storedBottomRef = useRef(0)
  const lastLineId = getLineId(logLines[logLines.length - 1])
  const afterList = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!scrollElement) return
    storedBottomRef.current = scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight
  }, [lastLineId, scrollElement])

  useLayoutEffect(() => {
    if (storedBottomRef.current < 100 && afterList.current) {
      afterList.current.scrollIntoView({ behavior: 'smooth' })
    }
  })

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
      <div className={'h-[16px]'} />
      <div ref={afterList} />
    </div>
  )
}

function getLineId(line: LogEvent | undefined) {
  if (!line) return 'none'
  return `${line.service}-${line.offset}-${line.timestamp}`
}
