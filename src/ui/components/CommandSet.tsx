import { useCallback } from 'react'

import { TopLevelView, useAppState } from '../appState'
import { socket } from '../socketio'

export const CommandSet: React.FC<{ services: string[] }> = ({ services }) => {
  const startServices = useCallback(() => {
    socket.emit('startServices', { services })
  }, [services])

  const stopServices = useCallback(() => {
    socket.emit('stopServices', { services })
  }, [services])

  const restartServices = useCallback(() => {
    socket.emit('restartServices', { services })
  }, [services])

  const [, setActiveView] = useAppState('global.activeView')
  const [, setLogServices] = useAppState('logView.activeServices')
  const [, setIsTailing] = useAppState('logView.isTailing')
  const accessLogs = useCallback(() => {
    setLogServices(services)
    setIsTailing(true)
    setActiveView(TopLevelView.LOGS)
  }, [services, setActiveView, setIsTailing, setLogServices])

  return (
    <>
      <ActionButton onClick={startServices}>▶</ActionButton>
      <ActionButton onClick={stopServices}>■</ActionButton>
      <ActionButton onClick={restartServices}>⟳</ActionButton>
      <ActionButton onClick={accessLogs}>☰</ActionButton>
    </>
  )
}

export const ActionButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
  <button {...props} className={`${props.className} hover:text-blue-500 mx-0.5`} />
)
