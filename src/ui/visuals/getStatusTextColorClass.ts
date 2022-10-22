import { Service } from '../data/DataContext'
import { ensureIsNever } from '../utils/ensureIsNever'

export function getStatusTextColorClass(status: Service['status']): string {
  switch (status) {
    case 'UNHEALTHY':
      return 'text-red-500'
    case 'STARTING':
      return 'text-teal-500'
    case 'STOPPED':
    case 'STOPPING':
      return 'text-zinc-500'
    case 'WAITING_DEPS':
      return 'text-slate-500'
    case 'RUNNING':
    case 'EXTERNAL':
    case 'RUNNING:HEALTHY':
      return 'text-sky-500'
    case 'UNKNOWN':
      return 'text-neutral-300'
    default:
      ensureIsNever(status)
      throw new Error('Invalid value for switch')
  }
}

export function getStatusBoxClasses(status: Service['status']): string {
  const common = 'rounded-tl-lg pl-2 pr-2 text-[0.7em]'
  switch (status) {
    case 'UNHEALTHY':
      return 'bg-red-500 text-white ' + common
    case 'STARTING':
      return 'bg-teal-500 text-white ' + common
    case 'STOPPED':
    case 'STOPPING':
      return 'bg-zinc-500 text-white ' + common
    case 'WAITING_DEPS':
      return 'bg-slate-500 ' + common
    case 'RUNNING':
    case 'EXTERNAL':
    case 'RUNNING:HEALTHY':
      return 'bg-sky-500 text-white ' + common
    case 'UNKNOWN':
      return 'bg-neutral-300 ' + common
    default:
      ensureIsNever(status)
      throw new Error('Invalid value for switch')
  }
}
