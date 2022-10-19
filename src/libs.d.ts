declare module 'tail-file' {
  class Tail {
    constructor(filename: string)
    on(event: 'line', handler: (line: string) => void): void
    start(): void
  }
  export = Tail
}
