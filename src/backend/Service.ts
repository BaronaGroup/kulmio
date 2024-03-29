import cp from 'child_process'
import fs from 'fs'
import path from 'path'

import mkdirp from 'mkdirp'

import { ServiceStatus } from '../common/types'
import { ensureIsNever } from '../ui/utils/ensureIsNever'
import { ServiceConfig } from './config'
import { logEvent } from './eventLogger'
import { RuntimeServerConfig } from './ServerModel'

const HEALTH_TIMEOUT = 5000

export default class Service {
  public readonly config: ServiceConfig
  private serverConfig: RuntimeServerConfig

  constructor(serverConfig: RuntimeServerConfig, serviceConfig: ServiceConfig) {
    this.serverConfig = serverConfig
    this.config = serviceConfig
  }

  get name() {
    return this.config.name
  }

  get aliases() {
    return [this.config.name, ...(this.config.aliases || [])]
  }

  get screenName() {
    return 'server-' + this.name + '.' + (this.config.screenSuffix || this.serverConfig.screenSuffix || 'kulmio')
  }

  get dependencies() {
    return this.config.dependencies || []
  }

  get softDependencies() {
    return this.config.softDependencies || []
  }

  private get pidFile() {
    const pidDir = this.serverConfig.baseDir + '/pids'
    if (!fs.existsSync(pidDir)) mkdirp.sync(pidDir)
    return pidDir + '/' + this.config.name + '.pid'
  }

  get logFile() {
    const logDir = this.serverConfig.baseDir + '/logs'
    if (!fs.existsSync(logDir)) mkdirp.sync(logDir)

    return logDir + '/' + this.config.name + '.log'
  }

  get actualWorkDir() {
    return path.resolve(this.serverConfig.baseDir, this.config.workDir)
  }

  public async getStatus(): Promise<ServiceStatus> {
    const status = await this.getStatusImpl()
    await logEvent(this.serverConfig, { type: 'STATUS_UPDATED', serviceName: this.name, status })
    return status
  }

  private async getStatusImpl(): Promise<ServiceStatus> {
    const pid = await this.getPid()
    const healthy = this.config.healthCommand && (await this.isHealthy())
    if (!pid && this.config.useHealthForIsRunning && healthy) {
      return 'EXTERNAL'
    } else if (pid) {
      if (!this.config.healthCommand) {
        return 'RUNNING'
      }
      if (healthy) return 'RUNNING:HEALTHY'
      return 'UNHEALTHY'
    } else {
      return 'STOPPED'
    }
  }

  public async getStatusString() {
    const status = await this.getStatus()

    switch (status) {
      case 'EXTERNAL':
        return 'Running externally'
      case 'RUNNING':
        return 'Running'
      case 'RUNNING:HEALTHY':
        return 'Running, healthy'
      case 'UNHEALTHY':
        return 'Running, NOT HEALTHY'
      case 'STOPPING':
        return 'Stopping'
      case 'STOPPED':
        return 'Stopped'
      case 'UNKNOWN':
        return 'Unknown'
      case 'STARTING':
        return 'Starting'
      case 'WAITING_DEPS':
        return 'Waiting for dependencies'
      default:
        ensureIsNever(status)
        throw new Error('Non-exhaustive switch')
    }
  }

  public async getPid() {
    if (!fs.existsSync(this.pidFile)) return null
    const pid = fs.readFileSync(this.pidFile, 'utf-8')
    if (!pid) return null
    const running = await new Promise((resolve) => {
      const child = cp.exec('ps -p ' + pid)
      child.on('exit', (code) => {
        if (code === 1) resolve(false)
        else resolve(true)
      })
    })
    return running ? +pid : null
  }

  public async isHealthy() {
    const command = this.config.healthCommand
    if (!command) return undefined

    // TODO: add way to get the output
    return new Promise((resolve) => {
      // TODO: kill the child process on timeout
      setTimeout(() => resolve(false), HEALTH_TIMEOUT)
      cp.exec(
        command,
        {
          cwd: this.actualWorkDir,
          env: {
            ...process.env,
            ...this.getEnvVariables(),
          },
        },
        (err, stdout, stderr) => {
          if (process.env.KULMIO_DEBUG) {
            console.log(err, stdout, stderr)
          }
          if (err) return resolve(false)
          resolve(true)
        }
      )
    })
  }

  public async isRunning() {
    if (this.config.useHealthForIsRunning) {
      return (await this.isHealthy()) === true
    }
    return (await this.getPid()) !== null
  }

  public async build() {
    const command = this.config.build
    if (!command) return
    console.log('Building', this.config.name)
    cp.execSync(command, {
      cwd: this.actualWorkDir,
      env: {
        ...process.env,
        ...this.getEnvVariables(),
      },
      stdio: 'inherit',
    })
  }

  public async start() {
    await logEvent(this.serverConfig, { type: 'STATUS_UPDATED', serviceName: this.name, status: 'STARTING' })
    const command = this.config.command + ' 2>&1 | tee -a ' + this.logFile
    const child = cp.spawn('screen', ['-D', '-m', '-S', this.screenName, 'bash', '-c', command], {
      cwd: this.actualWorkDir,
      env: {
        ...process.env,
        ...this.getEnvVariables(),
      },
      stdio: 'ignore',
      detached: true,
    })
    const pid = child.pid
    child.unref()
    if (pid) {
      fs.writeFileSync(this.pidFile, pid.toString(), 'utf-8')
    }
  }

  public execute(command: string[]) {
    console.log(`-- Executing on ${this.name} --`)
    const commandPrefix = 'execPrefix' in this.config ? this.config.execPrefix : ''

    const commandString = (commandPrefix ? commandPrefix + ' ' : '') + command.map(commandLineQuotes).join(' ')

    cp.execSync(commandString, {
      cwd: this.actualWorkDir,
      env: {
        ...process.env,
        ...this.getEnvVariables(),
      },
      stdio: 'inherit',
    })

    function commandLineQuotes(part: string) {
      if (part.includes(' ') || part.includes('"') || part.includes("'")) {
        // TODO: implement, presumably
      } else {
        return part
      }
    }
  }

  public async stop(force: boolean) {
    await logEvent(this.serverConfig, { type: 'STATUS_UPDATED', serviceName: this.name, status: 'STOPPING' })
    if (!force && this.config.stopCommand) {
      cp.execSync(this.config.stopCommand, {
        cwd: this.actualWorkDir,
        env: {
          ...process.env,
          ...this.getEnvVariables(),
        },
        stdio: 'inherit',
      })
      await logEvent(this.serverConfig, { type: 'STATUS_UPDATED', serviceName: this.name, status: 'STOPPED' })
    } else {
      await this.kill(force)
      await logEvent(this.serverConfig, { type: 'STATUS_UPDATED', serviceName: this.name, status: 'STOPPED' })
    }
  }

  public async kill(force: boolean) {
    const pid = await this.getPid()
    if (force) throw new Error('Force not supported at this time')
    if (pid) {
      // cp.execSync(`screen -XS ${this.screenName} quit`)
      killMany([pid, ...getChildren(pid)])
      while (await this.isRunning()) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
      fs.writeFileSync(this.pidFile, '', 'utf-8')
      console.log('Stopped ' + this.name)
    }

    function killMany(pids: number[]) {
      try {
        cp.execSync(`kill -- ${pids.join(' ')}`)
      } catch (err) {
        if (!err.message.includes('No such process')) throw err // TODO: make this more portable
      }
    }

    function* getChildren(parentPid: number): IterableIterator<number> {
      for (const childPid of findChildren(parentPid)) {
        yield* getChildren(childPid)
        yield childPid
      }
    }

    function findChildren(parentPid: number) {
      try {
        const a = cp
          .execSync(`pgrep -P ${parentPid}`)
          .toString('utf-8')
          .split('\n')
          .filter((x) => x)
        return a.map((l) => +l)
      } catch (err) {
        return []
      }
    }
  }

  public async restart() {
    if (await this.isRunning()) {
      await this.stop(false)
    }
    await this.start()
  }

  private getEnvVariables(): any {
    const baseDir = this.serverConfig.baseDir
    const envDir = baseDir + '/envs'

    const globalEnvs = (this.serverConfig.envDirectories || []).map((ed) => loadEnvFromFile(`${ed}/global.env`))
    const envName = this.config.envName || this.config.name
    const envsFromDirectories = (this.serverConfig.envDirectories || []).map((ed) =>
      loadEnvFromFile(`${ed}/${envName}.env`)
    )
    const configEnv: Record<string, string> = this.config.env || {}

    return combineEnv(
      loadEnvFromFile(envDir + '/global.env'),
      ...globalEnvs,
      loadEnvFromFiles(this.serverConfig.envFiles || []),
      loadEnvFromFile(envDir + '/' + envName + '.env'),
      ...envsFromDirectories,
      loadEnvFromFiles(this.config.envFiles || []),
      Object.keys(configEnv).map((key) => ({ key, value: configEnv[key] })),
      Object.entries(process.env).map(([key, value]) => ({ key, value: value as string }))
    )

    function combineEnv(...envParts: Array<Array<{ key: string; value: string }>>) {
      const output: Record<string, string> = {}
      for (const part of envParts) {
        for (const envVar of part) {
          if (envVar.key.endsWith('!')) {
            output[envVar.key.substring(0, envVar.key.length - 1)] = envVar.value
          } else {
            output[envVar.key] = envVar.value.replace(/\$(?:(\w+)|{(.+?)})/g, (_fullMatch, b, c) => {
              const variable = b || c
              return output[variable] || process.env[variable] || ''
            })
          }
        }
      }
      return output
    }

    function loadEnvFromFile(filename: string) {
      const fullName = path.resolve(baseDir, filename)
      const dirname = path.dirname(fullName)
      if (!fs.existsSync(fullName)) {
        return []
      }
      const data = fs.readFileSync(fullName, 'utf-8')
      return data
        .split(/[\r\n]+/)
        .map((l) => l.trim())
        .filter((s) => !!s)
        .map((e) => {
          const [key, value] = (e.match(/^(.+?)=(.+)$/) || []).slice(1)

          return { key, value: value?.replace(/__DIRNAME__/g, dirname) }
        })
        .filter(({ value }) => value !== undefined)
    }

    function loadEnvFromFiles(files: string[]) {
      return flatten(files.map(loadEnvFromFile))
    }
  }
}

function flatten<T>(arrays: T[][]): T[] {
  return ([] as T[]).concat(...arrays)
}
