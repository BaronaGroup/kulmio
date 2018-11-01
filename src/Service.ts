import {ServerConfig} from './ServerConfig'
import fs from 'fs'
import cp from 'child_process'
import path from 'path'

interface EnvObject {
  [name: string]: string
}

export interface ServiceConfig {
  name: string
  command: string
  workDir: string
  env?: EnvObject
  envFiles?: string[]
}

export default class Service {
  private config: ServiceConfig
  private serverConfig: ServerConfig

  constructor(serverConfig: ServerConfig, serviceConfig: ServiceConfig) {
    this.serverConfig = serverConfig
    this.config = serviceConfig
  }

  get name() {
    return this.config.name
  }

  get screenName() {
    return 'server-' + this.name + '.srv'
  }

  private get pidFile() {
    return this.serverConfig.baseDir + '/pids/' + this.config.name + '.pid'
  }

  get logFile() {
    return this.serverConfig.baseDir + '/logs/' + this.config.name + '.log'
  }

  public async getStatus() {
    const pid = await this.getPid()
    return pid ? 'Running #' + pid : 'Stopped'
  }

  public async getPid() {
    if (!fs.existsSync(this.pidFile)) return null
    const pid = fs.readFileSync(this.pidFile, 'UTF-8')
    if (!pid) return null
    const running = await new Promise((resolve) => {
      const child = cp.exec('ps -p ' + pid)
      child.on('exit', code => {
        if (code === 1) resolve(false)
        else resolve(true)
      })
    })
    return running ? parseInt(pid) : null
  }

  public async isRunning() {
    return (await this.getPid()) !== null
  }

  public async start() {

    const command = this.config.command + ' 2>&1 | tee -a ' + this.logFile
    const child = cp.spawn('screen', ['-D', '-m', '-S', this.screenName, 'bash', '-c', command], {
      cwd: this.config.workDir,
      env: {
        ...process.env,
        ...this.getEnvVariables(),
      },
      stdio: 'ignore',
      detached: true
    })
    const pid = child.pid
    child.unref()
    fs.writeFileSync(this.pidFile, pid.toString(), 'UTF-8')
  }

  public async stop(force: boolean) {
    const pid = await this.getPid()
    if (force) throw new Error('Force not supported at this time')
    if (pid) {
      // cp.execSync(`screen -XS ${this.screenName} quit`)
      killChildren(pid)
      kill(pid)
      while (await this.isRunning()) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      fs.writeFileSync(this.pidFile, '', 'UTF-8')
      console.log('Stopped ' + this.name)
    }

    function kill(pid: number) {
      cp.execSync(`kill -- -${pid}`)
    }

    function killChildren(pid: number) {
      for (const childPid of findChildren(pid)) {
        killChildren(childPid)
        kill(childPid)
      }
    }

    function findChildren(pid: number) {
      return cp.execSync(`pgrep -P ${pid}`).toString('utf-8').split('\n').map(l => parseInt(l))
    }
  }

  private getEnvVariables(): EnvObject {

    const baseDir = this.serverConfig.baseDir
    const envDir = baseDir + '/envs'

    return {
      ... loadEnvFromFile(envDir + '/global.env'),
      ... loadEnvFromFiles(this.serverConfig.envFiles || []),
      ... loadEnvFromFile(envDir + '/' + this.config.name + '.env'),
      ... loadEnvFromFiles(this.config.envFiles || []),
      ... this.config.env || {},
    }

    function loadEnvFromFile(filename: string) {
      const fullName = path.resolve(baseDir, filename)
      if (!fs.existsSync(fullName)) return {}
      const data = fs.readFileSync(fullName, 'UTF-8')
      const vars = data.split(/[\r\n]+/)
        .map(l => l.trim())
        .filter(s => !!s)
        .map(e => {
          return (e.match(/^(.+?)=(.+)$/) || []).slice(1)
        })

      return vars.reduce((memo, [key, val]) => ({...memo, [key]: val}), {})
    }

    function loadEnvFromFiles(files: string[]) {
      return files.map(loadEnvFromFile)
        .reduce((memo, additions) => ({...memo, ...additions}), {})
    }
  }
}
