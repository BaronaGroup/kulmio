export type ServiceStatus =
  | 'RUNNING'
  | 'RUNNING:HEALTHY'
  | 'EXTERNAL'
  | 'PENDING'
  | 'WAITING_DEPS'
  | 'STOPPED'
  | 'UNHEALTHY'
  | 'UNKNOWN'
