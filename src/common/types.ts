export type ServiceStatus =
  | 'RUNNING'
  | 'RUNNING:HEALTHY'
  | 'EXTERNAL'
  | 'STARTING'
  | 'WAITING_DEPS'
  | 'STOPPING'
  | 'STOPPED'
  | 'UNHEALTHY'
  | 'UNKNOWN'