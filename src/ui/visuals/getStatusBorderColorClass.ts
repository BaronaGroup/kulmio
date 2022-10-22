import { Service } from '../data/DataContext'
import { ensureIsNever } from '../utils/ensureIsNever'

export function getStatusBorderColorClass(status: Service['status']): string {
  switch (status) {
    case 'UNHEALTHY':
      return 'border-red-500'
    case 'STARTING':
      return 'border-teal-500'
    case 'STOPPED':
    case 'STOPPING':
      return 'border-zinc-500'
    case 'WAITING_DEPS':
      return 'border-slate-500'
    case 'RUNNING':
    case 'EXTERNAL':
    case 'RUNNING:HEALTHY':
      return 'border-sky-500'
    case 'UNKNOWN':
      return 'border-neutral-300'
    default:
      ensureIsNever(status)
      throw new Error('Invalid value for switch')
  }
}
