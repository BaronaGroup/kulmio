import { useCallback } from 'react'

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

  return (
    <>
      <ActionButton onClick={startServices}>▶</ActionButton>
      <ActionButton onClick={stopServices}>■</ActionButton>
      <ActionButton onClick={restartServices}>⟳</ActionButton>
      <ActionButton>☰</ActionButton>
    </>
  )
}

export const ActionButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
  <button {...props} className={`${props.className} hover:text-blue-500 mx-0.5`} />
)
