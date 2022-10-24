import { useEffect, useState } from 'react'

import { socket } from '../socketio'
import { useRerender } from '../utils/useRerender'

const bannerClasses = `fixed top-[30px] z-20 p-4 left-[calc(50vw_-_min(800px,_90vw)_/_2)] w-[min(800px,_90vw)] shadow-md border-2 rounded-lg`

export const ConnectionStatusBanner: React.FC = () => {
  const [statusText, setStatusText] = useState('')
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'error'>(
    socket.connected ? 'connected' : 'disconnected'
  )
  const [connectedSince, setConnectedSince] = useState<null | Date>(null)

  useEffect(() => {
    if (connectedSince && status !== 'connected') {
      setConnectedSince(null)
    } else if (!connectedSince && status === 'connected') {
      setConnectedSince(new Date())
    }
  }, [connectedSince, status])

  const refresh = useRerender()
  const connectedRecently = status === 'connected' && new Date().valueOf() - (connectedSince?.valueOf() ?? 0) < 2500

  useEffect(() => {
    if (connectedSince) {
      setTimeout(refresh, 2500)
    }
  }, [connectedSince, refresh])
  useEffect(() => {
    socket.on('disconnect', () => setStatus('disconnected'))
    socket.on('connect_error', (err) => {
      setStatus('error')
      setStatusText(err.message)
    })
    socket.on('connect', () => setStatus('connected'))
  }, [])
  if (status === 'connected')
    return (
      <div
        className={`${bannerClasses} bg-green-200 border-green-400 pointer-events-none transition-opacity  ${
          connectedRecently ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Connected
      </div>
    )

  if (status === 'disconnected') return <div className={`${bannerClasses} bg-red-200 border-red-400`}>Disconnected</div>
  return <div className={`${bannerClasses} bg-red-200 border-red-400`}>Error: ${statusText}</div>
}
