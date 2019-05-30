interface HelloCommand {
  command: 'hello'
  clientId: string
}

interface ClientErrorCommand {
  command: 'error'
  message: string
}

export type WSClientToServerCommand = HelloCommand | ClientErrorCommand

interface ExitCommand {
  command: 'exit'
}

export type WSServerToClientCommand = ExitCommand
